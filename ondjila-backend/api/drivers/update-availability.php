<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['is_available'])) {
    Response::error('Estado de disponibilidade em falta', 422);
}

$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);
$isAvailable = filter_var($data['is_available'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

if ($isAvailable === null) {
    Response::error('Estado de disponibilidade inválido', 422);
}

$conn->prepare('
    UPDATE drivers
    SET is_available = ?, updated_at = NOW()
    WHERE id = ?
')->execute([$isAvailable ? 1 : 0, $driverId]);

Response::success([
    'is_available' => $isAvailable,
    'updated_at' => date('c'),
], 'Disponibilidade atualizada', 200);
