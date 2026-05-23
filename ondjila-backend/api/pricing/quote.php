<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/DynamicPricingService.php';

$payload = AuthHelper::requireAuth();
$data = json_decode(file_get_contents('php://input'), true);

$errors = Validator::validate($data ?: [], [
    'origin_lat'   => 'required|numeric',
    'origin_lng'   => 'required|numeric',
    'dest_lat'     => 'required|numeric',
    'dest_lng'     => 'required|numeric',
    'vehicle_type' => 'required|in:economy,comfort,xl',
]);

if (!empty($errors)) {
    Response::error('Dados invalidos para simular tarifa', 422, $errors);
}

$conn = Database::getInstance()->getConnection();
$quote = DynamicPricingService::quote($conn, [
    ...$data,
    'ride_type' => $data['ride_type'] ?? 'individual',
], (int) $payload->sub, true);

Response::success(['quote' => $quote], 'Tarifa dinamica calculada');
