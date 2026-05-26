<?php
require_once __DIR__ . '/PricingSchemaHelper.php';
require_once __DIR__ . '/PricingControlService.php';
require_once __DIR__ . '/WeatherIntelligenceService.php';
require_once __DIR__ . '/TrafficIntelligenceService.php';
require_once __DIR__ . '/DemandSupplyService.php';
require_once __DIR__ . '/FareCalculatorHelper.php';
require_once __DIR__ . '/../config/constants.php';

class DynamicPricingService
{
    public static function quote(PDO $conn, array $input, ?int $passengerId = null, bool $persist = true): array
    {
        PricingSchemaHelper::ensure($conn);

        $vehicleType = $input['vehicle_type'] ?? 'economy';
        $rideType = $input['ride_type'] ?? 'individual';
        $originLat = (float) $input['origin_lat'];
        $originLng = (float) $input['origin_lng'];
        $destLat = (float) $input['dest_lat'];
        $destLng = (float) $input['dest_lng'];

        $controls = PricingControlService::get($conn);
        $traffic = TrafficIntelligenceService::estimate($originLat, $originLng, $destLat, $destLng);
        $weather = !empty($controls['weather_enabled'])
            ? WeatherIntelligenceService::current($originLat, $originLng)
            : ['multiplier' => 1.0, 'severity' => 'disabled', 'reason' => null];
        $demand = !empty($controls['demand_enabled'])
            ? DemandSupplyService::snapshot($conn, $originLat, $originLng, $vehicleType, $passengerId)
            : ['multiplier' => 1.0, 'cancellation_multiplier' => 1.0, 'pending_rides_20m' => 0, 'available_drivers_nearby' => 0, 'demand_supply_ratio' => 0, 'passenger_cancel_rate_14d' => 0];

        $distanceKm = (float) $traffic['distance_km'];
        $durationMinutes = (int) $traffic['duration_minutes'];
        $baseFare = self::baseFare($vehicleType, $distanceKm, $durationMinutes);

        $timeMultiplier = self::timeMultiplier($traffic);
        $zoneMultiplier = self::zoneMultiplier($traffic);
        $eventMultiplier = !empty($controls['events_enabled']) ? self::eventMultiplier($traffic) : 1.0;

        $multipliers = [
            'demand' => (float) $demand['multiplier'],
            'weather' => (float) $weather['multiplier'],
            'traffic' => !empty($controls['traffic_enabled']) ? (float) $traffic['multiplier'] : 1.0,
            'time' => $timeMultiplier,
            'zone' => $zoneMultiplier,
            'events' => $eventMultiplier,
            'cancellations' => (float) $demand['cancellation_multiplier'],
            'manual' => (float) $controls['manual_multiplier'],
        ];

        $rawMultiplier = !empty($controls['enabled'])
            ? array_product($multipliers)
            : 1.0;
        $minMultiplier = (float) $controls['min_multiplier'];
        $maxMultiplier = (float) $controls['max_multiplier'];
        $surgeMultiplier = round(max($minMultiplier, min($maxMultiplier, $rawMultiplier)), 2);

        $extras = self::extras($controls, $traffic, $demand);
        $subtotal = $baseFare * $surgeMultiplier;
        $finalFare = self::roundFare(max(FARE_MINIMUM[$vehicleType] ?? FARE_MINIMUM['economy'], $subtotal + array_sum($extras)));

        $reasons = self::reasons($multipliers, $surgeMultiplier, $weather, $traffic, $demand, $extras, $rawMultiplier > $maxMultiplier);
        $factors = [
            'traffic' => $traffic,
            'weather' => $weather,
            'demand_supply' => $demand,
            'extras' => $extras,
            'controls' => [
                'min_multiplier' => $minMultiplier,
                'max_multiplier' => $maxMultiplier,
                'enabled' => (bool) $controls['enabled'],
            ],
        ];

        $quote = [
            'quote_id' => null,
            'ride_type' => $rideType,
            'vehicle_type' => $vehicleType,
            'region' => $traffic['origin_zone']['name'] ?? DYNAMIC_PRICING_DEFAULT_CITY,
            'distance_km' => $distanceKm,
            'duration_minutes' => $durationMinutes,
            'stopped_minutes' => $traffic['stopped_minutes'],
            'average_speed_kmh' => $traffic['average_speed_kmh'],
            'base_fare' => round($baseFare, 2),
            'final_fare' => $finalFare,
            'surge_multiplier' => $surgeMultiplier,
            'multipliers' => $multipliers,
            'factors' => $factors,
            'reasons' => $reasons,
            'transparent_summary' => self::summary($baseFare, $surgeMultiplier, $extras, $finalFare),
        ];

        if ($persist) {
            $quote['quote_id'] = self::persistQuote($conn, $quote, $input, $passengerId);
            self::log($conn, $quote['quote_id'], 'info', 'Dynamic fare quote calculated', [
                'final_fare' => $finalFare,
                'surge_multiplier' => $surgeMultiplier,
                'region' => $quote['region'],
            ]);
        }

        return $quote;
    }

    public static function linkRide(PDO $conn, int $quoteId, int $rideId): void
    {
        $stmt = $conn->prepare('UPDATE pricing_quotes SET ride_id = ? WHERE id = ?');
        $stmt->execute([$rideId, $quoteId]);
    }

    public static function usableQuote(PDO $conn, int $quoteId, int $passengerId, string $vehicleType, string $rideType, array $input): ?array
    {
        PricingSchemaHelper::ensure($conn);

        $stmt = $conn->prepare("
            SELECT *
            FROM pricing_quotes
            WHERE id = ?
              AND passenger_id = ?
              AND vehicle_type = ?
              AND ride_type = ?
              AND ABS(origin_lat - ?) < 0.0002
              AND ABS(origin_lng - ?) < 0.0002
              AND ABS(destination_lat - ?) < 0.0002
              AND ABS(destination_lng - ?) < 0.0002
              AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)
            LIMIT 1
        ");
        $stmt->execute([
            $quoteId,
            $passengerId,
            $vehicleType,
            $rideType,
            (float) $input['origin_lat'],
            (float) $input['origin_lng'],
            (float) $input['dest_lat'],
            (float) $input['dest_lng'],
        ]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        return [
            'quote_id' => (int) $row['id'],
            'ride_type' => $row['ride_type'],
            'vehicle_type' => $row['vehicle_type'],
            'region' => $row['region'],
            'distance_km' => (float) $row['distance_km'],
            'duration_minutes' => (int) $row['duration_minutes'],
            'stopped_minutes' => (int) ((json_decode($row['factors'] ?? '{}', true)['traffic']['stopped_minutes'] ?? 0)),
            'average_speed_kmh' => (float) ((json_decode($row['factors'] ?? '{}', true)['traffic']['average_speed_kmh'] ?? 0)),
            'base_fare' => (float) $row['base_fare'],
            'final_fare' => (float) $row['final_fare'],
            'surge_multiplier' => (float) $row['surge_multiplier'],
            'multipliers' => json_decode($row['multipliers'] ?? '{}', true) ?: [],
            'factors' => json_decode($row['factors'] ?? '{}', true) ?: [],
            'reasons' => json_decode($row['reasons'] ?? '[]', true) ?: [],
            'transparent_summary' => [
                'formula' => '(base + distancia + tempo) x multiplicador + taxas controladas',
                'base_component' => (float) $row['base_fare'],
                'multiplier_component' => (float) $row['surge_multiplier'],
                'extras_total' => 0,
                'final_fare' => (float) $row['final_fare'],
            ],
        ];
    }

    public static function publicQuote(array $quote): array
    {
        $vehicleType = $quote['vehicle_type'];
        return [
            'quote_id' => $quote['quote_id'],
            'ride_type' => $quote['ride_type'],
            'vehicle_type' => $vehicleType,
            'label_key' => $vehicleType === 'comfort' ? 'passenger.comfortRide' : 'passenger.economyRide',
            'description_key' => $vehicleType === 'comfort' ? 'passenger.comfortDescription' : 'passenger.economyDescription',
            'features_keys' => $vehicleType === 'comfort'
                ? ['passenger.comfortFeatureSpace', 'passenger.comfortFeatureRating', 'passenger.comfortFeatureAc']
                : ['passenger.economyFeaturePrice', 'passenger.economyFeatureDaily', 'passenger.economyFeatureSimple'],
            'final_fare' => $quote['final_fare'],
            'formatted_fare' => number_format(round((float) $quote['final_fare']), 0, ',', '.') . ' AOA',
            'distance_km' => $quote['distance_km'],
            'duration_minutes' => $quote['duration_minutes'],
            'price_lock_minutes' => 10,
        ];
    }

    public static function metrics(PDO $conn): array
    {
        PricingSchemaHelper::ensure($conn);

        $summary = $conn->query("
            SELECT
                COUNT(*) AS total_quotes,
                AVG(final_fare) AS avg_fare,
                AVG(surge_multiplier) AS avg_multiplier,
                MAX(surge_multiplier) AS max_multiplier
            FROM pricing_quotes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ")->fetch(PDO::FETCH_ASSOC) ?: [];

        $zones = $conn->query("
            SELECT region, COUNT(*) AS quotes, AVG(surge_multiplier) AS avg_multiplier, AVG(final_fare) AS avg_fare
            FROM pricing_quotes
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY region
            ORDER BY quotes DESC
            LIMIT 8
        ")->fetchAll(PDO::FETCH_ASSOC);

        $history = $conn->query("
            SELECT id, region, vehicle_type, distance_km, duration_minutes, final_fare, surge_multiplier, reasons, created_at
            FROM pricing_quotes
            ORDER BY id DESC
            LIMIT 20
        ")->fetchAll(PDO::FETCH_ASSOC);

        return [
            'summary' => [
                'total_quotes' => (int) ($summary['total_quotes'] ?? 0),
                'avg_fare' => round((float) ($summary['avg_fare'] ?? 0), 2),
                'avg_multiplier' => round((float) ($summary['avg_multiplier'] ?? 1), 2),
                'max_multiplier' => round((float) ($summary['max_multiplier'] ?? 1), 2),
            ],
            'zones' => array_map(fn($z) => [
                'region' => $z['region'],
                'quotes' => (int) $z['quotes'],
                'avg_multiplier' => round((float) $z['avg_multiplier'], 2),
                'avg_fare' => round((float) $z['avg_fare'], 2),
            ], $zones),
            'history' => array_map(fn($h) => [
                ...$h,
                'id' => (int) $h['id'],
                'distance_km' => (float) $h['distance_km'],
                'duration_minutes' => (int) $h['duration_minutes'],
                'final_fare' => (float) $h['final_fare'],
                'surge_multiplier' => (float) $h['surge_multiplier'],
                'reasons' => json_decode($h['reasons'] ?? '[]', true) ?: [],
            ], $history),
        ];
    }

    private static function baseFare(string $vehicleType, float $distanceKm, int $durationMinutes): float
    {
        $base = FARE_BASE[$vehicleType] ?? FARE_BASE['economy'];
        $perKm = FARE_PER_KM[$vehicleType] ?? FARE_PER_KM['economy'];
        $perMin = FARE_PER_MIN[$vehicleType] ?? FARE_PER_MIN['economy'];
        return $base + ($distanceKm * $perKm) + ($durationMinutes * $perMin);
    }

    private static function timeMultiplier(array $traffic): float
    {
        if (!empty($traffic['is_peak'])) return 1.15;
        if (!empty($traffic['is_night'])) return 1.08;
        if (!empty($traffic['is_weekend'])) return 1.06;
        return 1.0;
    }

    private static function zoneMultiplier(array $traffic): float
    {
        $origin = (float) ($traffic['origin_zone']['busy_factor'] ?? 1.0);
        $dest = (float) ($traffic['destination_zone']['busy_factor'] ?? 1.0);
        return round(min(1.2, max($origin, $dest)), 2);
    }

    private static function eventMultiplier(array $traffic): float
    {
        $hour = (int) date('G');
        $weekendNight = !empty($traffic['is_weekend']) && $hour >= 18;
        $specialDate = in_array(date('m-d'), ['01-01', '02-04', '03-08', '11-11', '12-25'], true);

        if (!$weekendNight && !$specialDate) return 1.0;

        $origin = (float) ($traffic['origin_zone']['event_factor'] ?? 1.0);
        $dest = (float) ($traffic['destination_zone']['event_factor'] ?? 1.0);
        return round(min(1.18, max($origin, $dest, $specialDate ? 1.14 : 1.0)), 2);
    }

    private static function extras(array $controls, array $traffic, array $demand): array
    {
        $extras = [];
        if (!empty($traffic['is_night'])) {
            $extras['night_fee'] = (float) $controls['night_fee'];
        }
        if (($traffic['origin_zone']['is_busy_zone'] ?? false) && ((float) $traffic['congestion_score']) >= 0.45) {
            $extras['busy_zone_fee'] = (float) $controls['busy_zone_fee'];
        }
        if (((float) ($demand['passenger_cancel_rate_14d'] ?? 0)) >= 0.45) {
            $extras['cancellation_risk_fee'] = 90;
        }
        return $extras;
    }

    private static function reasons(array $multipliers, float $surgeMultiplier, array $weather, array $traffic, array $demand, array $extras, bool $capped): array
    {
        $reasons = [];
        $labels = [
            'demand' => 'Procura acima da oferta de motoristas.',
            'traffic' => 'Trânsito lento aumentou o tempo estimado.',
            'time' => 'Horário com maior movimento urbano.',
            'zone' => 'Origem ou destino em zona movimentada.',
            'events' => 'Evento, fim de semana ou feriado com procura especial.',
            'cancellations' => 'Histórico recente de cancelamentos elevou o risco operacional.',
            'manual' => 'Ajuste operacional ativo pelo administrador.',
        ];

        foreach ($multipliers as $key => $value) {
            if ($value > 1.03 && isset($labels[$key])) {
                $reasons[] = ['code' => $key, 'label' => $labels[$key], 'impact' => '+' . round(($value - 1) * 100) . '%'];
            }
        }
        if (($weather['multiplier'] ?? 1) > 1.03 && !empty($weather['reason'])) {
            $reasons[] = ['code' => 'weather', 'label' => $weather['reason'], 'impact' => '+' . round(((float) $weather['multiplier'] - 1) * 100) . '%'];
        }
        foreach ($extras as $code => $amount) {
            $reasons[] = ['code' => $code, 'label' => 'Taxa extra aplicada de forma limitada.', 'impact' => '+' . round($amount) . ' AOA'];
        }
        if ($capped) {
            $reasons[] = ['code' => 'cap', 'label' => 'Multiplicador limitado para evitar preço abusivo.', 'impact' => 'cap ' . $surgeMultiplier . 'x'];
        }
        if (!$reasons) {
            $reasons[] = ['code' => 'normal', 'label' => 'Preço normal para a zona e horário atuais.', 'impact' => '0%'];
        }

        return $reasons;
    }

    private static function summary(float $baseFare, float $surgeMultiplier, array $extras, float $finalFare): array
    {
        return [
            'formula' => '(base + distancia + tempo) x multiplicador + taxas controladas',
            'base_component' => round($baseFare, 2),
            'multiplier_component' => $surgeMultiplier,
            'extras_total' => round(array_sum($extras), 2),
            'final_fare' => $finalFare,
        ];
    }

    private static function persistQuote(PDO $conn, array $quote, array $input, ?int $passengerId): int
    {
        $stmt = $conn->prepare("
            INSERT INTO pricing_quotes (
                passenger_id, ride_type, vehicle_type,
                origin_lat, origin_lng, destination_lat, destination_lng,
                region, distance_km, duration_minutes, base_fare, final_fare,
                surge_multiplier, multipliers, factors, reasons
            ) VALUES (
                :passenger_id, :ride_type, :vehicle_type,
                :origin_lat, :origin_lng, :dest_lat, :dest_lng,
                :region, :distance_km, :duration_minutes, :base_fare, :final_fare,
                :surge_multiplier, :multipliers, :factors, :reasons
            )
        ");
        $stmt->execute([
            ':passenger_id' => $passengerId,
            ':ride_type' => $quote['ride_type'],
            ':vehicle_type' => $quote['vehicle_type'],
            ':origin_lat' => $input['origin_lat'],
            ':origin_lng' => $input['origin_lng'],
            ':dest_lat' => $input['dest_lat'],
            ':dest_lng' => $input['dest_lng'],
            ':region' => $quote['region'],
            ':distance_km' => $quote['distance_km'],
            ':duration_minutes' => $quote['duration_minutes'],
            ':base_fare' => $quote['base_fare'],
            ':final_fare' => $quote['final_fare'],
            ':surge_multiplier' => $quote['surge_multiplier'],
            ':multipliers' => json_encode($quote['multipliers'], JSON_UNESCAPED_UNICODE),
            ':factors' => json_encode($quote['factors'], JSON_UNESCAPED_UNICODE),
            ':reasons' => json_encode($quote['reasons'], JSON_UNESCAPED_UNICODE),
        ]);
        return (int) $conn->lastInsertId();
    }

    private static function log(PDO $conn, ?int $quoteId, string $level, string $message, array $context = []): void
    {
        $stmt = $conn->prepare('INSERT INTO dynamic_pricing_logs (quote_id, level, message, context) VALUES (?, ?, ?, ?)');
        $stmt->execute([$quoteId, $level, $message, json_encode($context, JSON_UNESCAPED_UNICODE)]);
    }

    private static function roundFare(float $value): float
    {
        return round($value / 10) * 10;
    }
}
