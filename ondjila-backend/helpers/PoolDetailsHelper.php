<?php
require_once __DIR__ . '/PoolRouteHelper.php';
require_once __DIR__ . '/FareCalculatorHelper.php';

class PoolDetailsHelper
{
    public static function getGroupDetails(PDO $conn, int $poolGroupId, int $forUserId): ?array
    {
        $groupStmt = $conn->prepare("
            SELECT pg.*, d.id as driver_table_id, u.name as driver_name, u.avatar_url as driver_avatar,
                   d.vehicle_brand, d.vehicle_model, d.vehicle_plate, d.vehicle_color,
                   d.current_lat as driver_lat, d.current_lng as driver_lng
            FROM pool_groups pg
            LEFT JOIN drivers d ON pg.driver_id = d.id
            LEFT JOIN users u ON d.user_id = u.id
            WHERE pg.id = ?
        ");
        $groupStmt->execute([$poolGroupId]);
        $group = $groupStmt->fetch(PDO::FETCH_ASSOC);

        if (!$group) {
            return null;
        }

        $ridesStmt = $conn->prepare("
            SELECT r.id, r.passenger_id, r.origin_address, r.origin_lat, r.origin_lng,
                   r.destination_address, r.destination_lat, r.destination_lng,
                   r.status, r.pool_status, r.pickup_order, r.fare_final, r.fare_original,
                   r.pool_discount_pct, u.name as passenger_name, u.avatar_url as passenger_avatar
            FROM rides r
            JOIN users u ON r.passenger_id = u.id
            WHERE r.pool_group_id = ? AND r.status NOT IN ('cancelled')
            ORDER BY r.pickup_order ASC, r.id ASC
        ");
        $ridesStmt->execute([$poolGroupId]);
        $rides = $ridesStmt->fetchAll(PDO::FETCH_ASSOC);

        $routeData = $group['route_data'] ? json_decode($group['route_data'], true) : null;
        $scenario = $routeData['scenario'] ?? PoolRouteHelper::SCENARIO_FORMING;

        $myRide = null;
        $coPassengers = [];
        foreach ($rides as $ride) {
            if ((int) $ride['passenger_id'] === $forUserId) {
                $myRide = $ride;
            } else {
                $coPassengers[] = [
                    'passenger_id' => (int) $ride['passenger_id'],
                    'name' => $ride['passenger_name'],
                    'avatar_url' => $ride['passenger_avatar'],
                    'origin_address' => $ride['origin_address'],
                    'destination_address' => $ride['destination_address'],
                    'pickup_order' => (int) $ride['pickup_order'],
                    'pool_status' => $ride['pool_status'],
                ];
            }
        }

        $uiState = self::mapUiState($group['status'], $myRide['pool_status'] ?? 'waiting_match', $group);

        $soloFare = $myRide
            ? (float) ($myRide['fare_original'] ?: $myRide['fare_final'])
            : 0;
        $poolFare = $myRide ? (float) $myRide['fare_final'] : 0;
        $savings = max(0, $soloFare - $poolFare);

        return [
            'pool_group_id' => (int) $group['id'],
            'status' => $group['status'],
            'ui_state' => $uiState,
            'scenario' => $scenario,
            'scenario_label' => self::scenarioLabel($scenario),
            'passenger_count' => (int) $group['current_count'],
            'max_passengers' => (int) $group['max_passengers'],
            'vehicle_type' => $group['vehicle_type'],
            'route' => $routeData,
            'driver' => $group['driver_table_id'] ? [
                'name' => $group['driver_name'],
                'avatar_url' => $group['driver_avatar'],
                'vehicle' => trim(($group['vehicle_brand'] ?? '') . ' ' . ($group['vehicle_model'] ?? '')),
                'plate' => $group['vehicle_plate'],
                'color' => $group['vehicle_color'],
                'lat' => $group['driver_lat'] ? (float) $group['driver_lat'] : null,
                'lng' => $group['driver_lng'] ? (float) $group['driver_lng'] : null,
            ] : null,
            'my_ride' => $myRide ? [
                'id' => (int) $myRide['id'],
                'fare_individual' => $soloFare,
                'fare_pool' => $poolFare,
                'savings' => $savings,
                'discount_pct' => (float) ($myRide['pool_discount_pct'] ?? 0),
                'pickup_order' => (int) $myRide['pickup_order'],
                'origin' => [
                    'address' => $myRide['origin_address'],
                    'lat' => (float) $myRide['origin_lat'],
                    'lng' => (float) $myRide['origin_lng'],
                ],
                'destination' => [
                    'address' => $myRide['destination_address'],
                    'lat' => (float) $myRide['destination_lat'],
                    'lng' => (float) $myRide['destination_lng'],
                ],
            ] : null,
            'co_passengers' => $coPassengers,
            'estimated_duration_min' => $routeData['estimated_duration_min'] ?? null,
            'extra_time_minutes' => $routeData['extra_time_minutes'] ?? 0,
        ];
    }

    public static function scenarioLabel(string $scenario): string
    {
        return match ($scenario) {
            PoolRouteHelper::SCENARIO_SAME_ORIGIN_DEST => 'Mesmo ponto de partida e destino',
            PoolRouteHelper::SCENARIO_DIFF_ORIGIN_SAME_DEST => 'Recolhas diferentes, mesmo destino',
            default => 'A procurar passageiros compatíveis',
        };
    }

    public static function mapUiState(string $groupStatus, string $poolStatus, array $group): string
    {
        if ($groupStatus === 'completed') {
            return 'completed';
        }
        if ($groupStatus === 'cancelled') {
            return 'cancelled';
        }
        if ($poolStatus === 'waiting_match' && $groupStatus === 'forming') {
            return 'searching_passengers';
        }
        if ($poolStatus === 'matched' && in_array($groupStatus, ['forming', 'active'], true)) {
            return $group['driver_id'] ? 'driver_en_route' : 'pool_found';
        }
        if ($poolStatus === 'boarding') {
            return 'passenger_picked_up';
        }
        if ($groupStatus === 'in_progress' || $poolStatus === 'in_progress') {
            return 'ride_in_progress';
        }
        if ($poolStatus === 'delivered') {
            return 'completed';
        }
        return 'searching_passengers';
    }
}
