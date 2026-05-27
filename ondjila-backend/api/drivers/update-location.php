<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/NearbyRideHelper.php';

$payload = AuthHelper::requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
$errors = Validator::validate($data ?: [], [
    'lat' => 'required|numeric',
    'lng' => 'required|numeric',
]);

if (!empty($errors)) {
    Response::error('Dados inválidos', 422, $errors);
}

$lat = (float) $data['lat'];
$lng = (float) $data['lng'];

if (!NearbyRideHelper::isValidCoordinate($lat, $lng)) {
    Response::error('Coordenadas inválidas', 422, [
        'lat' => ['Latitude deve estar entre -90 e 90.'],
        'lng' => ['Longitude deve estar entre -180 e 180.'],
    ]);
}

$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$conn->prepare('
    UPDATE drivers
    SET current_lat = ?, current_lng = ?, is_available = 1, updated_at = NOW()
    WHERE id = ?
')->execute([$lat, $lng, $driverId]);

Response::success([
    'lat' => $lat,
    'lng' => $lng,
    'updated_at' => date('c'),
], 'Localização actualizada', 200);
