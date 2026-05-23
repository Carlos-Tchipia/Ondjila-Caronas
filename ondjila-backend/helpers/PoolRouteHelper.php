<?php
require_once __DIR__ . '/HaversineHelper.php';
require_once __DIR__ . '/FareCalculatorHelper.php';

class PoolRouteHelper
{
    public const SCENARIO_SAME_ORIGIN_DEST = 'same_origin_same_dest';
    public const SCENARIO_DIFF_ORIGIN_SAME_DEST = 'diff_origin_same_dest';
    public const SCENARIO_FORMING = 'forming';

    public const ORIGIN_SAME_THRESHOLD_KM = 0.35;
    public const DEST_SAME_THRESHOLD_KM = 0.8;
    public const ORIGIN_MATCH_MAX_KM = 2.0;
    public const DEST_MATCH_MAX_KM = 1.2;
    public const MAX_BEARING_DIFF = 45;

    public static function detectScenario(
        float $newOriginLat,
        float $newOriginLng,
        float $newDestLat,
        float $newDestLng,
        array $existingRides
    ): string {
        if (count($existingRides) === 0) {
            return self::SCENARIO_FORMING;
        }

        $sameDest = true;
        $sameOrigin = true;

        foreach ($existingRides as $ride) {
            $destDist = HaversineHelper::distance(
                $newDestLat,
                $newDestLng,
                (float) $ride['destination_lat'],
                (float) $ride['destination_lng']
            );
            if ($destDist > self::DEST_SAME_THRESHOLD_KM) {
                $sameDest = false;
            }

            $originDist = HaversineHelper::distance(
                $newOriginLat,
                $newOriginLng,
                (float) $ride['origin_lat'],
                (float) $ride['origin_lng']
            );
            if ($originDist > self::ORIGIN_SAME_THRESHOLD_KM) {
                $sameOrigin = false;
            }
        }

        if ($sameOrigin && $sameDest) {
            return self::SCENARIO_SAME_ORIGIN_DEST;
        }

        if ($sameDest) {
            return self::SCENARIO_DIFF_ORIGIN_SAME_DEST;
        }

        return self::SCENARIO_FORMING;
    }

    /**
     * Ordem de recolha: mais próximo do primeiro ponto de referência (primeira origem do grupo).
     */
    public static function computePickupOrder(array $rides): array
    {
        if (count($rides) <= 1) {
            return $rides;
        }

        usort($rides, static function ($a, $b) {
            return ((int) ($a['pickup_order'] ?? 99)) <=> ((int) ($b['pickup_order'] ?? 99));
        });

        $refLat = (float) $rides[0]['origin_lat'];
        $refLng = (float) $rides[0]['origin_lng'];

        usort($rides, static function ($a, $b) use ($refLat, $refLng) {
            $da = HaversineHelper::distance(
                $refLat,
                $refLng,
                (float) $a['origin_lat'],
                (float) $a['origin_lng']
            );
            $db = HaversineHelper::distance(
                $refLat,
                $refLng,
                (float) $b['origin_lat'],
                (float) $b['origin_lng']
            );
            return $da <=> $db;
        });

        $order = 1;
        foreach ($rides as &$ride) {
            $ride['pickup_order'] = $order++;
        }

        return $rides;
    }

    /**
     * Estima tempo extra (min) para cenário com origens diferentes.
     */
    public static function estimateExtraMinutes(array $orderedPickups, float $destLat, float $destLng): int
    {
        if (count($orderedPickups) < 2) {
            return 0;
        }

        $extraKm = 0.0;
        $prevLat = (float) $orderedPickups[0]['origin_lat'];
        $prevLng = (float) $orderedPickups[0]['origin_lng'];

        for ($i = 1; $i < count($orderedPickups); $i++) {
            $lat = (float) $orderedPickups[$i]['origin_lat'];
            $lng = (float) $orderedPickups[$i]['origin_lng'];
            $extraKm += HaversineHelper::distance($prevLat, $prevLng, $lat, $lng);
            $prevLat = $lat;
            $prevLng = $lng;
        }

        $directKm = HaversineHelper::distance(
            (float) $orderedPickups[0]['origin_lat'],
            (float) $orderedPickups[0]['origin_lng'],
            $destLat,
            $destLng
        );

        $chainKm = $directKm + $extraKm;
        $detourKm = max(0, $chainKm - $directKm);

        return (int) max(3, round($detourKm * 2.5));
    }

    public static function buildRoutePayload(
        array $rides,
        string $scenario,
        string $vehicleType
    ): array {
        $ordered = self::computePickupOrder($rides);
        $destLat = (float) $ordered[0]['destination_lat'];
        $destLng = (float) $ordered[0]['destination_lng'];

        $legs = array_map(static function ($r) {
            return [
                'origin_lat' => (float) $r['origin_lat'],
                'origin_lng' => (float) $r['origin_lng'],
                'destination_lat' => (float) $r['destination_lat'],
                'destination_lng' => (float) $r['destination_lng'],
            ];
        }, $ordered);

        $fareSplit = FareCalculatorHelper::splitPoolFares($vehicleType, $legs, $scenario);
        $extraMin = $scenario === self::SCENARIO_DIFF_ORIGIN_SAME_DEST
            ? self::estimateExtraMinutes($ordered, $destLat, $destLng)
            : 0;

        $waypoints = [];
        foreach ($ordered as $r) {
            $waypoints[] = [
                'type' => 'pickup',
                'passenger_id' => (int) $r['passenger_id'],
                'lat' => (float) $r['origin_lat'],
                'lng' => (float) $r['origin_lng'],
                'address' => $r['origin_address'] ?? '',
                'order' => (int) $r['pickup_order'],
            ];
        }
        $waypoints[] = [
            'type' => 'dropoff',
            'lat' => $destLat,
            'lng' => $destLng,
            'address' => $ordered[0]['destination_address'] ?? '',
            'order' => count($ordered) + 1,
        ];

        $totalKm = 0.0;
        $prevLat = (float) $ordered[0]['origin_lat'];
        $prevLng = (float) $ordered[0]['origin_lng'];
        foreach ($ordered as $r) {
            $lat = (float) $r['origin_lat'];
            $lng = (float) $r['origin_lng'];
            if ($lat !== $prevLat || $lng !== $prevLng) {
                $totalKm += HaversineHelper::distance($prevLat, $prevLng, $lat, $lng);
            }
            $prevLat = $lat;
            $prevLng = $lng;
        }
        $totalKm += HaversineHelper::distance($prevLat, $prevLng, $destLat, $destLng);

        return [
            'scenario' => $scenario,
            'waypoints' => $waypoints,
            'pickup_order' => array_map(static fn ($r) => [
                'ride_id' => (int) $r['id'],
                'passenger_id' => (int) $r['passenger_id'],
                'order' => (int) $r['pickup_order'],
            ], $ordered),
            'passenger_count' => count($ordered),
            'extra_time_minutes' => $extraMin,
            'total_distance_km' => round($totalKm, 2),
            'estimated_duration_min' => (int) max(8, round($totalKm * 2.8) + $extraMin),
            'fare_split' => $fareSplit,
        ];
    }

    public static function persistGroupRoute(PDO $conn, int $poolGroupId, array $routePayload): void
    {
        $stmt = $conn->prepare('UPDATE pool_groups SET route_data = ? WHERE id = ?');
        $stmt->execute([json_encode($routePayload, JSON_UNESCAPED_UNICODE), $poolGroupId]);

        if (!empty($routePayload['pickup_order']) && !empty($routePayload['fare_split']['fares'])) {
            $orders = $routePayload['pickup_order'];
            $fares = $routePayload['fare_split']['fares'];
            $discount = $routePayload['fare_split']['discount_pct'];

            foreach ($orders as $idx => $item) {
                $fare = $fares[$idx] ?? $fares[0];
                $upd = $conn->prepare('
                    UPDATE rides SET
                        pickup_order = ?,
                        fare_final = ?,
                        fare_estimate = ?,
                        pool_discount_pct = ?,
                        distance_km = ?
                    WHERE id = ?
                ');
                $upd->execute([
                    $item['order'],
                    $fare,
                    $fare,
                    $discount,
                    $routePayload['total_distance_km'] ?? null,
                    $item['ride_id'],
                ]);
            }
        }
    }
}
