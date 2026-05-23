<?php
require_once __DIR__ . '/HaversineHelper.php';
require_once __DIR__ . '/PoolRouteHelper.php';

class PoolMatchingHelper
{
    /**
     * Encontra grupos pool compatíveis.
     * Cenário 1: mesma origem + mesmo destino (prioridade máxima)
     * Cenário 2: origens diferentes, mesmo destino (bearing + destino próximo)
     */
    public static function findMatches(
        PDO $conn,
        float $originLat,
        float $originLng,
        float $destLat,
        float $destLng,
        string $vehicleType
    ): array {
        $newBearing = self::calculateBearing($originLat, $originLng, $destLat, $destLng);

        $stmt = $conn->prepare("
            SELECT pg.id, pg.vehicle_type, pg.current_count, pg.max_passengers, pg.route_data
            FROM pool_groups pg
            WHERE pg.status IN ('forming', 'active')
              AND pg.current_count < pg.max_passengers
              AND pg.vehicle_type = :v_type
        ");
        $stmt->execute([':v_type' => $vehicleType]);
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $matches = [];

        foreach ($groups as $group) {
            $ridesStmt = $conn->prepare("
                SELECT id, passenger_id, origin_lat, origin_lng, destination_lat, destination_lng,
                       origin_address, destination_address, pickup_order
                FROM rides
                WHERE pool_group_id = ? AND status NOT IN ('cancelled', 'completed')
                ORDER BY pickup_order ASC, id ASC
            ");
            $ridesStmt->execute([$group['id']]);
            $rides = $ridesStmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($rides) === 0) {
                continue;
            }

            $scenario = PoolRouteHelper::detectScenario(
                $originLat,
                $originLng,
                $destLat,
                $destLng,
                $rides
            );

            if ($scenario === PoolRouteHelper::SCENARIO_FORMING) {
                continue;
            }

            $ref = $rides[0];
            $groupBearing = self::calculateBearing(
                (float) $ref['origin_lat'],
                (float) $ref['origin_lng'],
                (float) $ref['destination_lat'],
                (float) $ref['destination_lng']
            );

            $bearingDiff = self::bearingDifference($newBearing, $groupBearing);
            if ($bearingDiff > PoolRouteHelper::MAX_BEARING_DIFF) {
                continue;
            }

            $destDist = HaversineHelper::distance(
                $destLat,
                $destLng,
                (float) $ref['destination_lat'],
                (float) $ref['destination_lng']
            );
            if ($destDist > PoolRouteHelper::DEST_MATCH_MAX_KM) {
                continue;
            }

            if ($scenario === PoolRouteHelper::SCENARIO_DIFF_ORIGIN_SAME_DEST) {
                $minOriginDist = PHP_FLOAT_MAX;
                foreach ($rides as $ride) {
                    $d = HaversineHelper::distance(
                        $originLat,
                        $originLng,
                        (float) $ride['origin_lat'],
                        (float) $ride['origin_lng']
                    );
                    $minOriginDist = min($minOriginDist, $d);
                }
                if ($minOriginDist < PoolRouteHelper::ORIGIN_SAME_THRESHOLD_KM) {
                    $scenario = PoolRouteHelper::SCENARIO_SAME_ORIGIN_DEST;
                }
            }

            $originDist = HaversineHelper::distance(
                $originLat,
                $originLng,
                (float) $ref['origin_lat'],
                (float) $ref['origin_lng']
            );

            if (
                $scenario === PoolRouteHelper::SCENARIO_SAME_ORIGIN_DEST
                && $originDist > PoolRouteHelper::ORIGIN_MATCH_MAX_KM
            ) {
                continue;
            }

            if (
                $scenario === PoolRouteHelper::SCENARIO_DIFF_ORIGIN_SAME_DEST
                && $originDist > PoolRouteHelper::ORIGIN_MATCH_MAX_KM * 1.5
            ) {
                continue;
            }

            $priority = $scenario === PoolRouteHelper::SCENARIO_SAME_ORIGIN_DEST ? 0 : 1;
            $group['match_scenario'] = $scenario;
            $group['deviation_score'] = $priority * 100 + $bearingDiff + ($originDist * 8) + ($destDist * 5);
            $group['existing_rides'] = $rides;
            $matches[] = $group;
        }

        usort($matches, static function ($a, $b) {
            return $a['deviation_score'] <=> $b['deviation_score'];
        });

        return $matches;
    }

    public static function bearingDifference(float $a, float $b): float
    {
        $diff = abs($a - $b);
        return $diff > 180 ? 360 - $diff : $diff;
    }

    public static function calculateBearing(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $lat1 = deg2rad($lat1);
        $lng1 = deg2rad($lng1);
        $lat2 = deg2rad($lat2);
        $lng2 = deg2rad($lng2);

        $dLng = $lng2 - $lng1;
        $y = sin($dLng) * cos($lat2);
        $x = cos($lat1) * sin($lat2) - sin($lat1) * cos($lat2) * cos($dLng);

        return fmod((rad2deg(atan2($y, $x)) + 360), 360);
    }
}
