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
$rideType = $data['ride_type'] ?? 'individual';
$categories = ['economy', 'comfort'];
$quotes = [];

foreach ($categories as $category) {
    $quote = DynamicPricingService::quote($conn, [
        ...$data,
        'vehicle_type' => $category,
        'ride_type' => $rideType,
    ], (int) $payload->sub, true);

    $quotes[$category] = DynamicPricingService::publicQuote($quote);
}

$selected = $data['vehicle_type'];

Response::success([
    'quote' => $quotes[$selected] ?? $quotes['economy'],
    'quotes' => $quotes,
], 'Preco fechado calculado');
