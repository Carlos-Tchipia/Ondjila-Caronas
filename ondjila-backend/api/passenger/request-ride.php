<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/FareCalculatorHelper.php';
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
    Response::error('Dados invalidos', 422, $errors);
}

$originAddress = trim($data['origin_address'] ?? 'Origem');
$destAddress = trim($data['destination_address'] ?? 'Destino');
$vehicleType = $data['vehicle_type'];

$conn = Database::getInstance()->getConnection();

$conn->prepare("
    UPDATE rides
    SET status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = 'Substituída por novo pedido individual'
    WHERE passenger_id = ?
      AND ride_type = 'individual'
      AND status = 'pending'
      AND driver_id IS NULL
")->execute([$payload->sub]);

$pricingQuote = null;
if (!empty($data['pricing_quote_id'])) {
    $pricingQuote = DynamicPricingService::usableQuote(
        $conn,
        (int) $data['pricing_quote_id'],
        (int) $payload->sub,
        $vehicleType,
        'individual',
        $data
    );
}

if (!$pricingQuote) {
    $pricingQuote = DynamicPricingService::quote($conn, [
        'origin_lat' => $data['origin_lat'],
        'origin_lng' => $data['origin_lng'],
        'dest_lat' => $data['dest_lat'],
        'dest_lng' => $data['dest_lng'],
        'vehicle_type' => $vehicleType,
        'ride_type' => 'individual',
    ], (int) $payload->sub, true);
}
$distanceKm = (float) $pricingQuote['distance_km'];
$durationMinutes = (int) $pricingQuote['duration_minutes'];
$fare = (float) $pricingQuote['final_fare'];
$baseFare = (float) $pricingQuote['base_fare'];

$stmt = $conn->prepare("
    INSERT INTO rides (
        passenger_id, ride_type,
        origin_address, origin_lat, origin_lng,
        destination_address, destination_lat, destination_lng,
        vehicle_type, status,
        fare_estimate, fare_final, fare_original, distance_km, duration_minutes,
        pricing_quote_id, surge_multiplier, fare_breakdown, payment_method, is_paid
    ) VALUES (
        :pass_id, 'individual',
        :o_addr, :o_lat, :o_lng,
        :d_addr, :d_lat, :d_lng,
        :v_type, 'pending',
        :fare_estimate, :fare_final, :base_fare, :dist_km, :duration_min,
        :quote_id, :surge_multiplier, :fare_breakdown, NULL, 0
    )
");

$stmt->execute([
    ':pass_id' => $payload->sub,
    ':o_addr' => $originAddress,
    ':o_lat' => $data['origin_lat'],
    ':o_lng' => $data['origin_lng'],
    ':d_addr' => $destAddress,
    ':d_lat' => $data['dest_lat'],
    ':d_lng' => $data['dest_lng'],
    ':v_type' => $vehicleType,
    ':fare_estimate' => $fare,
    ':fare_final' => $fare,
    ':base_fare' => $baseFare,
    ':dist_km' => $distanceKm,
    ':duration_min' => $durationMinutes,
    ':quote_id' => $pricingQuote['quote_id'],
    ':surge_multiplier' => $pricingQuote['surge_multiplier'],
    ':fare_breakdown' => json_encode($pricingQuote, JSON_UNESCAPED_UNICODE),
]);

$rideId = (int) $conn->lastInsertId();
if (!empty($pricingQuote['quote_id'])) {
    DynamicPricingService::linkRide($conn, (int) $pricingQuote['quote_id'], $rideId);
}

Response::success([
    'ride_id' => $rideId,
    'ride_type' => 'individual',
    'fare_estimate' => $fare,
    'distance_km' => $distanceKm,
    'duration_minutes' => $durationMinutes,
    'pricing' => DynamicPricingService::publicQuote($pricingQuote),
], 'Pedido de viagem individual registado', 201);
