<?php
require_once __DIR__ . '/HaversineHelper.php';
require_once __DIR__ . '/../config/constants.php';

class FareCalculatorHelper
{
    /** Distância em km entre origem e destino */
    public static function tripDistanceKm(
        float $originLat,
        float $originLng,
        float $destLat,
        float $destLng
    ): float {
        return round(
            HaversineHelper::distance($originLat, $originLng, $destLat, $destLng),
            2
        );
    }

    /** Tarifa individual estimada (sem pool) */
    public static function soloFare(string $vehicleType, float $distanceKm): float
    {
        $base = FARE_BASE[$vehicleType] ?? FARE_BASE['economy'];
        $perKm = FARE_PER_KM[$vehicleType] ?? FARE_PER_KM['economy'];
        return round($base + ($distanceKm * $perKm), 2);
    }

    public static function soloFareWithTime(string $vehicleType, float $distanceKm, int $durationMinutes): float
    {
        $base = FARE_BASE[$vehicleType] ?? FARE_BASE['economy'];
        $perKm = FARE_PER_KM[$vehicleType] ?? FARE_PER_KM['economy'];
        $perMin = FARE_PER_MIN[$vehicleType] ?? FARE_PER_MIN['economy'];
        $minimum = FARE_MINIMUM[$vehicleType] ?? FARE_MINIMUM['economy'];
        return round(max($minimum, $base + ($distanceKm * $perKm) + ($durationMinutes * $perMin)), 2);
    }

    /**
     * Desconto pool conforme número de passageiros (30%–50%).
     */
    public static function poolDiscountPct(int $passengerCount): float
    {
        $count = max(1, min(4, $passengerCount));
        $pct = POOL_DISCOUNT_MIN + (($count - 1) * 0.05);
        return min(POOL_DISCOUNT_MAX, $pct);
    }

    /**
     * @param array<int, array{origin_lat: float, origin_lng: float, destination_lat: float, destination_lng: float}> $legs
     * @return array{fares: float[], solo_total: float, pool_total: float, discount_pct: float}
     */
    public static function splitPoolFares(
        string $vehicleType,
        array $legs,
        string $scenario
    ): array {
        $soloFares = [];
        $soloTotal = 0.0;

        foreach ($legs as $leg) {
            if (isset($leg['fare_original']) && (float) $leg['fare_original'] > 0) {
                $fare = (float) $leg['fare_original'];
            } else {
                $km = self::tripDistanceKm(
                    (float) $leg['origin_lat'],
                    (float) $leg['origin_lng'],
                    (float) $leg['destination_lat'],
                    (float) $leg['destination_lng']
                );
                $fare = self::soloFare($vehicleType, $km);
            }
            $soloFares[] = $fare;
            $soloTotal += $fare;
        }

        $n = count($legs);
        $discountPct = self::poolDiscountPct($n);
        $poolTotal = round($soloTotal * (1 - $discountPct), 2);

        if ($scenario === 'same_origin_same_dest' || $n === 1) {
            $share = $n > 0 ? round($poolTotal / $n, 2) : 0;
            $fares = array_fill(0, $n, $share);
        } else {
            $weights = [];
            $weightSum = 0.0;
            foreach ($legs as $i => $leg) {
                $weights[$i] = $soloFares[$i];
                $weightSum += $soloFares[$i];
            }
            $fares = [];
            $allocated = 0.0;
            for ($i = 0; $i < $n; $i++) {
                if ($i === $n - 1) {
                    $fares[$i] = round($poolTotal - $allocated, 2);
                } else {
                    $share = $weightSum > 0
                        ? round($poolTotal * ($weights[$i] / $weightSum), 2)
                        : round($poolTotal / $n, 2);
                    $fares[$i] = $share;
                    $allocated += $share;
                }
            }
        }

        return [
            'fares' => $fares,
            'solo_total' => $soloTotal,
            'pool_total' => $poolTotal,
            'discount_pct' => round($discountPct * 100, 1),
        ];
    }
}
