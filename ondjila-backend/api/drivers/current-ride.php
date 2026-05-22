<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$stmt = $conn->prepare("
    SELECT pg.id, pg.status, pg.current_count, pg.max_passengers,
           r.origin_address, r.destination_address,
           r.origin_lat, r.origin_lng, r.destination_lat, r.destination_lng
    FROM pool_groups pg
    JOIN rides r ON r.pool_group_id = pg.id
    WHERE pg.driver_id = ? AND pg.status IN ('active', 'in_progress')
    LIMIT 1
");
$stmt->execute([$driverId]);
$currentRide = $stmt->fetch(PDO::FETCH_ASSOC);

if ($currentRide) {
    Response::success(['ride' => $currentRide], 'Viagem em curso encontrada', 200);
} else {
    Response::success(['ride' => null], 'Nenhuma viagem ativa', 200);
}
