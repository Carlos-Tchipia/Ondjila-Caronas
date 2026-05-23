<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/PoolDetailsHelper.php';

$payload = AuthHelper::requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
$errors = Validator::validate($data ?: [], [
    'pool_group_id' => 'required|numeric',
]);

if (!empty($errors)) {
    Response::error('Dados inválidos', 422, $errors);
}

$poolGroupId = (int) $data['pool_group_id'];
$conn = Database::getInstance()->getConnection();

$stmt = $conn->prepare("
    SELECT id FROM rides
    WHERE pool_group_id = ? AND passenger_id = ? AND status = 'pending'
    LIMIT 1
");
$stmt->execute([$poolGroupId, $payload->sub]);
$rideId = $stmt->fetchColumn();

if (!$rideId) {
    Response::error('Corrida não encontrada ou já confirmada', 404);
}

$conn->prepare("
    UPDATE rides SET pool_status = 'matched'
    WHERE id = ?
")->execute([$rideId]);

$details = PoolDetailsHelper::getGroupDetails($conn, $poolGroupId, (int) $payload->sub);

Response::success([
    'confirmed' => true,
    'pool' => $details,
], 'Participação no pool confirmada', 200);
