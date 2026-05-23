<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/PoolRouteHelper.php';
require_once '../../helpers/PoolDetailsHelper.php';

$payload = AuthHelper::requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['pool_group_id'])) {
    Response::error('ID do Pool Group em falta', 422);
}

$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$conn->beginTransaction();

try {
    $updateGroup = $conn->prepare("UPDATE pool_groups SET driver_id = ?, status = 'active' WHERE id = ? AND driver_id IS NULL AND status = 'forming'");
    $updateGroup->execute([$driverId, $data['pool_group_id']]);

    if ($updateGroup->rowCount() === 0) {
        throw new Exception("Pool já atribuído ou indisponível.");
    }

    $updateRides = $conn->prepare("
        UPDATE rides SET status = 'accepted', pool_status = 'matched', driver_id = ?
        WHERE pool_group_id = ? AND status = 'pending'
    ");
    $updateRides->execute([$driverId, $data['pool_group_id']]);

    $ridesStmt = $conn->prepare("
        SELECT id, passenger_id, origin_lat, origin_lng, destination_lat, destination_lng,
               origin_address, destination_address, pickup_order
        FROM rides WHERE pool_group_id = ? AND status = 'accepted'
    ");
    $ridesStmt->execute([$data['pool_group_id']]);
    $rides = $ridesStmt->fetchAll(PDO::FETCH_ASSOC);

    $groupStmt = $conn->prepare('SELECT vehicle_type, route_data FROM pool_groups WHERE id = ?');
    $groupStmt->execute([$data['pool_group_id']]);
    $group = $groupStmt->fetch(PDO::FETCH_ASSOC);
    $existingRoute = $group['route_data'] ? json_decode($group['route_data'], true) : null;
    $scenario = $existingRoute['scenario'] ?? PoolRouteHelper::SCENARIO_SAME_ORIGIN_DEST;

    $routePayload = PoolRouteHelper::buildRoutePayload($rides, $scenario, $group['vehicle_type']);
    PoolRouteHelper::persistGroupRoute($conn, (int) $data['pool_group_id'], $routePayload);

    $conn->commit();

    $details = PoolDetailsHelper::getGroupDetails($conn, (int) $data['pool_group_id'], (int) $payload->sub);

    Response::success(['pool' => $details], 'Viagem aceite com sucesso. Dirija-se ao local de encontro.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao aceitar viagem: ' . $e->getMessage(), 500);
}
