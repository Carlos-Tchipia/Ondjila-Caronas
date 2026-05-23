<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$stmt = $conn->prepare("
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
$stmt->execute([$driverId]);
$currentRide = $stmt->fetch(PDO::FETCH_ASSOC);

if ($currentRide) {
    $currentRide['route'] = $currentRide['route_data']
        ? json_decode($currentRide['route_data'], true)
        : null;
    unset($currentRide['route_data']);
    $currentRide['id'] = (int) $currentRide['id'];
    $currentRide['current_count'] = (int) $currentRide['current_count'];
    $currentRide['max_passengers'] = (int) $currentRide['max_passengers'];
    Response::success(['ride' => $currentRide], 'Viagem em curso encontrada', 200);
} else {
    Response::success(['ride' => null], 'Nenhuma viagem ativa', 200);
}
