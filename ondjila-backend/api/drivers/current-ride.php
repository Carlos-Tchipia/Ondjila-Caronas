<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$individualStmt = $conn->prepare("
    SELECT id, status, ride_type, origin_address, destination_address,
           origin_lat, origin_lng, destination_lat, destination_lng,
           distance_km, duration_minutes, fare_final
    FROM rides
    WHERE driver_id = ?
      AND ride_type = 'individual'
      AND status IN ('accepted', 'in_progress')
    ORDER BY accepted_at DESC, id DESC
    LIMIT 1
");
$individualStmt->execute([$driverId]);
$individualRide = $individualStmt->fetch(PDO::FETCH_ASSOC);

if ($individualRide) {
    Response::success(['ride' => [
        'id' => (int) $individualRide['id'],
        'ride_type' => 'individual',
        'status' => $individualRide['status'],
        'current_count' => 1,
        'max_passengers' => 1,
        'origin_address' => $individualRide['origin_address'],
        'destination_address' => $individualRide['destination_address'],
        'origin_lat' => (float) $individualRide['origin_lat'],
        'origin_lng' => (float) $individualRide['origin_lng'],
        'destination_lat' => (float) $individualRide['destination_lat'],
        'destination_lng' => (float) $individualRide['destination_lng'],
        'distance_km' => $individualRide['distance_km'] !== null ? (float) $individualRide['distance_km'] : null,
        'duration_minutes' => $individualRide['duration_minutes'] !== null ? (int) $individualRide['duration_minutes'] : null,
        'fare_final' => $individualRide['fare_final'] !== null ? (float) $individualRide['fare_final'] : null,
        'route' => null,
    ]], 'Corrida individual em curso encontrada', 200);
}

$poolStmt = $conn->prepare("
    SELECT pg.id, pg.status, pg.current_count, pg.max_passengers, pg.route_data, pg.vehicle_type,
           MIN(r.origin_address) as origin_address,
           MAX(r.destination_address) as destination_address,
           MIN(r.origin_lat) as origin_lat, MIN(r.origin_lng) as origin_lng,
           MAX(r.destination_lat) as destination_lat, MAX(r.destination_lng) as destination_lng
    FROM pool_groups pg
    JOIN rides r ON r.pool_group_id = pg.id
    WHERE pg.driver_id = ? AND pg.status IN ('active', 'in_progress')
    GROUP BY pg.id
    LIMIT 1
");
$poolStmt->execute([$driverId]);
$currentRide = $poolStmt->fetch(PDO::FETCH_ASSOC);

if ($currentRide) {
    $currentRide['ride_type'] = 'pool';
    $currentRide['route'] = $currentRide['route_data']
        ? json_decode($currentRide['route_data'], true)
        : null;
    unset($currentRide['route_data']);
    $currentRide['id'] = (int) $currentRide['id'];
    $currentRide['current_count'] = (int) $currentRide['current_count'];
    $currentRide['max_passengers'] = (int) $currentRide['max_passengers'];
    Response::success(['ride' => $currentRide], 'Pool em curso encontrado', 200);
}

Response::success(['ride' => null], 'Nenhuma viagem ativa', 200);
