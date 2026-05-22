<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

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

    $updateRides = $conn->prepare("UPDATE rides SET status = 'accepted', pool_status = 'matched' WHERE pool_group_id = ? AND status = 'pending'");
    $updateRides->execute([$data['pool_group_id']]);

    $conn->commit();
    Response::success(null, 'Viagem aceite com sucesso. Dirija-se ao local de encontro.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao aceitar viagem: ' . $e->getMessage(), 500);
}
