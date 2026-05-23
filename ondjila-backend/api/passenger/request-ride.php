<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/FareCalculatorHelper.php';
require_once '../../helpers/AuthHelper.php';

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

$distanceKm = FareCalculatorHelper::tripDistanceKm(
    (float) $data['origin_lat'],
    (float) $data['origin_lng'],
    (float) $data['dest_lat'],
    (float) $data['dest_lng']
);
$fare = FareCalculatorHelper::soloFare($vehicleType, $distanceKm);

$stmtBalance = $conn->prepare('SELECT wallet_balance FROM users WHERE id = ?');
$stmtBalance->execute([$payload->sub]);
$balance = (float) $stmtBalance->fetchColumn();

if ($balance < $fare * 0.5) {
    Response::error('Saldo insuficiente na carteira virtual', 402);
}

$stmt = $conn->prepare("
    INSERT INTO rides (
        passenger_id, ride_type,
        origin_address, origin_lat, origin_lng,
        destination_address, destination_lat, destination_lng,
        vehicle_type, status,
        fare_estimate, fare_final, fare_original, distance_km
    ) VALUES (
        :pass_id, 'individual',
        :o_addr, :o_lat, :o_lng,
        :d_addr, :d_lat, :d_lng,
        :v_type, 'pending',
        :fare, :fare, :fare, :dist_km
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
    ':fare' => $fare,
    ':dist_km' => $distanceKm,
]);

Response::success([
    'ride_id' => (int) $conn->lastInsertId(),
    'ride_type' => 'individual',
    'fare_estimate' => $fare,
    'distance_km' => $distanceKm,
], 'Pedido de viagem individual registado', 201);
