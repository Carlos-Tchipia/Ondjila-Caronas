<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/PoolMatchingHelper.php';
require_once '../../helpers/PoolRouteHelper.php';
require_once '../../helpers/FareCalculatorHelper.php';
require_once '../../helpers/PoolDetailsHelper.php';
require_once '../../config/constants.php';
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
    Response::error('Dados inválidos', 422, $errors);
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
$soloFare = FareCalculatorHelper::soloFare($vehicleType, $distanceKm);

$stmtBalance = $conn->prepare('SELECT wallet_balance FROM users WHERE id = ?');
$stmtBalance->execute([$payload->sub]);
$balance = (float) $stmtBalance->fetchColumn();

if ($balance < $soloFare * 0.5) {
    Response::error('Saldo insuficiente na carteira virtual', 402);
}

$matches = PoolMatchingHelper::findMatches(
    $conn,
    (float) $data['origin_lat'],
    (float) $data['origin_lng'],
    (float) $data['dest_lat'],
    (float) $data['dest_lng'],
    $vehicleType
);

$conn->beginTransaction();

try {
    if (count($matches) > 0) {
        $best = $matches[0];
        $poolGroupId = (int) $best['id'];
        $scenario = $best['match_scenario'];

        $poolFareEstimate = round($soloFare * (1 - FareCalculatorHelper::poolDiscountPct(2)), 2);

        $insertRide = $conn->prepare("
            INSERT INTO rides (
                passenger_id, pool_group_id, ride_type,
                origin_address, origin_lat, origin_lng,
                destination_address, destination_lat, destination_lng,
                vehicle_type, status, pool_status,
                fare_estimate, fare_final, fare_original, distance_km, pool_discount_pct
            ) VALUES (
                :pass_id, :pool_id, 'pool',
                :o_addr, :o_lat, :o_lng,
                :d_addr, :d_lat, :d_lng,
                :v_type, 'pending', 'matched',
                :fare_est, :fare_est, :fare_orig, :dist_km, :disc
            )
        ");

        $disc = FareCalculatorHelper::poolDiscountPct((int) $best['current_count'] + 1) * 100;
        $insertRide->execute([
            ':pass_id' => $payload->sub,
            ':pool_id' => $poolGroupId,
            ':o_addr' => $originAddress,
            ':o_lat' => $data['origin_lat'],
            ':o_lng' => $data['origin_lng'],
            ':d_addr' => $destAddress,
            ':d_lat' => $data['dest_lat'],
            ':d_lng' => $data['dest_lng'],
            ':v_type' => $vehicleType,
            ':fare_est' => $poolFareEstimate,
            ':fare_orig' => $soloFare,
            ':dist_km' => $distanceKm,
            ':disc' => $disc,
        ]);

        $conn->prepare('UPDATE pool_groups SET current_count = current_count + 1 WHERE id = ?')
            ->execute([$poolGroupId]);

        $ridesStmt = $conn->prepare("
            SELECT id, passenger_id, origin_lat, origin_lng, destination_lat, destination_lng,
                   origin_address, destination_address, pickup_order
            FROM rides WHERE pool_group_id = ? AND status NOT IN ('cancelled')
        ");
        $ridesStmt->execute([$poolGroupId]);
        $allRides = $ridesStmt->fetchAll(PDO::FETCH_ASSOC);

        $routePayload = PoolRouteHelper::buildRoutePayload($allRides, $scenario, $vehicleType);
        PoolRouteHelper::persistGroupRoute($conn, $poolGroupId, $routePayload);

        $conn->commit();

        $details = PoolDetailsHelper::getGroupDetails($conn, $poolGroupId, (int) $payload->sub);

        Response::success([
            'match_found' => true,
            'pool_group_id' => $poolGroupId,
            'scenario' => $scenario,
            'scenario_label' => PoolDetailsHelper::scenarioLabel($scenario),
            'pool_details' => $details,
        ], 'Match de carona encontrado!', 200);
    } else {
        $insertGroup = $conn->prepare("
            INSERT INTO pool_groups (vehicle_type, status, current_count, max_passengers)
            VALUES (:v_type, 'forming', 1, 3)
        ");
        $insertGroup->execute([':v_type' => $vehicleType]);
        $newGroupId = (int) $conn->lastInsertId();

        $disc = FareCalculatorHelper::poolDiscountPct(1) * 100;

        $insertRide = $conn->prepare("
            INSERT INTO rides (
                passenger_id, pool_group_id, ride_type,
                origin_address, origin_lat, origin_lng,
                destination_address, destination_lat, destination_lng,
                vehicle_type, status, pool_status,
                fare_estimate, fare_final, fare_original, distance_km, pool_discount_pct, pickup_order
            ) VALUES (
                :pass_id, :pool_id, 'pool',
                :o_addr, :o_lat, :o_lng,
                :d_addr, :d_lat, :d_lng,
                :v_type, 'pending', 'waiting_match',
                :fare, :fare, :fare_orig, :dist_km, :disc, 1
            )
        ");

        $insertRide->execute([
            ':pass_id' => $payload->sub,
            ':pool_id' => $newGroupId,
            ':o_addr' => $originAddress,
            ':o_lat' => $data['origin_lat'],
            ':o_lng' => $data['origin_lng'],
            ':d_addr' => $destAddress,
            ':d_lat' => $data['dest_lat'],
            ':d_lng' => $data['dest_lng'],
            ':v_type' => $vehicleType,
            ':fare' => $soloFare,
            ':fare_orig' => $soloFare,
            ':dist_km' => $distanceKm,
            ':disc' => $disc,
        ]);

        $newRideId = (int) $conn->lastInsertId();

        $routePayload = PoolRouteHelper::buildRoutePayload(
            [[
                'id' => $newRideId,
                'passenger_id' => $payload->sub,
                'origin_lat' => $data['origin_lat'],
                'origin_lng' => $data['origin_lng'],
                'destination_lat' => $data['dest_lat'],
                'destination_lng' => $data['dest_lng'],
                'origin_address' => $originAddress,
                'destination_address' => $destAddress,
                'pickup_order' => 1,
            ]],
            PoolRouteHelper::SCENARIO_FORMING,
            $vehicleType
        );
        PoolRouteHelper::persistGroupRoute($conn, $newGroupId, $routePayload);

        $conn->commit();

        Response::success([
            'match_found' => false,
            'pool_group_id' => $newGroupId,
            'scenario' => PoolRouteHelper::SCENARIO_FORMING,
            'ui_state' => 'searching_passengers',
            'fare_individual' => $soloFare,
            'estimated_duration_min' => $routePayload['estimated_duration_min'] ?? null,
        ], 'A procurar parceiros de viagem...', 201);
    }
} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao processar pedido de carona: ' . $e->getMessage(), 500);
}
