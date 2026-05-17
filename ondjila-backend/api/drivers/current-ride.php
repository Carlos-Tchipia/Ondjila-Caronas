<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../config/jwt.php';

$headers = apache_request_headers();
if (!isset($headers['Authorization'])) {
    Response::error('Não autorizado', 401);
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$payload = JwtHelper::decodeToken($token);

$conn = Database::getInstance()->getConnection();

// Buscar id do motorista
$stmtDriver = $conn->prepare("SELECT id FROM drivers WHERE user_id = ?");
$stmtDriver->execute([$payload->sub]);
$driverRow = $stmtDriver->fetch();

if (!$driverRow) {
    Response::error("Conta não está registada como motorista.", 403);
}

// Procurar uma viagem ativa para este motorista (active ou in_progress)
$stmt = $conn->prepare("
    SELECT pg.id, pg.status, pg.current_count, pg.max_passengers,
           r.origin_address, r.destination_address,
           r.origin_lat, r.origin_lng, r.destination_lat, r.destination_lng
    FROM pool_groups pg
    JOIN rides r ON r.pool_group_id = pg.id
    WHERE pg.driver_id = ? AND pg.status IN ('active', 'in_progress')
    LIMIT 1
");
$stmt->execute([$driverRow['id']]);
$currentRide = $stmt->fetch(PDO::FETCH_ASSOC);

if ($currentRide) {
    Response::success(['ride' => $currentRide], 'Viagem em curso encontrada', 200);
} else {
    Response::success(['ride' => null], 'Nenhuma viagem ativa', 200);
}
