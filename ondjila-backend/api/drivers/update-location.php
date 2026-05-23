<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
$errors = Validator::validate($data ?: [], [
    'lat' => 'required|numeric',
    'lng' => 'required|numeric',
]);

if (!empty($errors)) {
    Response::error('Dados inválidos', 422, $errors);
}

$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$conn->prepare('
    UPDATE drivers SET current_lat = ?, current_lng = ?, is_available = 1
    WHERE id = ?
')->execute([(float) $data['lat'], (float) $data['lng'], $driverId]);

Response::success([
    'lat' => (float) $data['lat'],
    'lng' => (float) $data['lng'],
    'updated_at' => date('c'),
], 'Localização actualizada', 200);
