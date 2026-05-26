<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/PoolDetailsHelper.php';
require_once '../../helpers/PricingSchemaHelper.php';

$payload = AuthHelper::requireAuth();

$conn = Database::getInstance()->getConnection();
PricingSchemaHelper::ensure($conn);

$query = "
    SELECT r.id, r.status, r.pool_group_id, r.pool_status, r.ride_type,
           r.origin_address, r.origin_lat, r.origin_lng,
           r.destination_address, r.destination_lat, r.destination_lng,
           r.fare_final, r.fare_original, r.pickup_order, r.pool_discount_pct,
           r.payment_method, r.is_paid,
           r.distance_km, r.duration_minutes,
           pg.status as pool_group_status, pg.route_data,
           COALESCE(pg.driver_id, r.driver_id) as driver_id,
           pg.current_count, pg.max_passengers,
           d.vehicle_brand, d.vehicle_model, d.vehicle_plate, d.vehicle_color,
           d.current_lat as driver_lat, d.current_lng as driver_lng,
           u.name as driver_name, u.avatar_url as driver_avatar
    FROM rides r
    LEFT JOIN pool_groups pg ON r.pool_group_id = pg.id
    LEFT JOIN drivers d ON d.id = COALESCE(pg.driver_id, r.driver_id)
    LEFT JOIN users u ON d.user_id = u.id
    WHERE r.passenger_id = ?
      AND (
        r.status IN ('pending', 'accepted', 'in_progress')
        OR (r.status = 'completed' AND r.is_paid = 0)
      )
      AND (
        r.status <> 'pending'
        OR r.created_at >= COALESCE((
            SELECT MAX(done.completed_at)
            FROM rides done
            WHERE done.passenger_id = ?
              AND done.status = 'completed'
        ), '1970-01-01')
      )
    ORDER BY r.created_at DESC
    LIMIT 1
";

$stmt = $conn->prepare($query);
$stmt->execute([$payload->sub, $payload->sub]);
$currentRide = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$currentRide) {
    Response::success(['ride' => null], 'Nenhuma viagem ativa', 200);
}

$poolDetails = null;
if ($currentRide['pool_group_id']) {
    $poolDetails = PoolDetailsHelper::getGroupDetails(
        $conn,
        (int) $currentRide['pool_group_id'],
        (int) $payload->sub
    );
}

$routeData = $currentRide['route_data'] ? json_decode($currentRide['route_data'], true) : null;

$ride = [
    'id' => (int) $currentRide['id'],
    'status' => $currentRide['status'],
    'ride_type' => $currentRide['ride_type'],
    'pool_group_id' => $currentRide['pool_group_id'] ? (int) $currentRide['pool_group_id'] : null,
    'pool_status' => $currentRide['pool_status'],
    'pool_group_status' => $currentRide['pool_group_status'],
    'ui_state' => $currentRide['ride_type'] === 'pool' ? ($poolDetails['ui_state'] ?? 'searching_passengers') : null,
    'origin_address' => $currentRide['origin_address'],
    'origin_lat' => (float) $currentRide['origin_lat'],
    'origin_lng' => (float) $currentRide['origin_lng'],
    'destination_address' => $currentRide['destination_address'],
    'destination_lat' => (float) $currentRide['destination_lat'],
    'destination_lng' => (float) $currentRide['destination_lng'],
    'fare_final' => (float) $currentRide['fare_final'],
    'fare_original' => (float) $currentRide['fare_original'],
    'payment_method' => $currentRide['payment_method'],
    'is_paid' => (bool) $currentRide['is_paid'],
    'distance_km' => (float) $currentRide['distance_km'],
    'duration_minutes' => $currentRide['duration_minutes'] ? (int) $currentRide['duration_minutes'] : null,
    'savings' => max(0, (float) $currentRide['fare_original'] - (float) $currentRide['fare_final']),
    'pickup_order' => (int) $currentRide['pickup_order'],
    'driver_id' => $currentRide['driver_id'],
    'driver_name' => $currentRide['driver_name'],
    'driver_avatar' => $currentRide['driver_avatar'],
    'driver_lat' => $currentRide['driver_lat'] ? (float) $currentRide['driver_lat'] : null,
    'driver_lng' => $currentRide['driver_lng'] ? (float) $currentRide['driver_lng'] : null,
    'vehicle_brand' => $currentRide['vehicle_brand'],
    'vehicle_model' => $currentRide['vehicle_model'],
    'vehicle_plate' => $currentRide['vehicle_plate'],
    'vehicle_color' => $currentRide['vehicle_color'],
    'passenger_count' => (int) ($currentRide['current_count'] ?? 1),
    'max_passengers' => (int) ($currentRide['max_passengers'] ?? 3),
    'route' => $routeData,
    'pool' => $poolDetails,
];

Response::success(['ride' => $ride], 'Viagem encontrada', 200);
