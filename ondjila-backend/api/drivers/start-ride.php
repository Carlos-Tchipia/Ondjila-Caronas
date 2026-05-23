<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['pool_group_id'])) Response::error('ID do Pool Group em falta', 422);

$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$conn->beginTransaction();

try {
    $stmt1 = $conn->prepare("UPDATE pool_groups SET status = 'in_progress', started_at = NOW() WHERE id = ? AND driver_id = ? AND status = 'active'");
    $stmt1->execute([$data['pool_group_id'], $driverId]);

    if ($stmt1->rowCount() === 0) {
        throw new Exception("Pool Group não encontrado ou já iniciado.");
    }

    $conn->prepare("
        UPDATE rides SET pool_status = 'boarding', accepted_at = COALESCE(accepted_at, NOW())
        WHERE pool_group_id = ? AND status = 'accepted'
    ")->execute([$data['pool_group_id']]);

    $stmt2 = $conn->prepare("
        UPDATE rides SET status = 'in_progress', pool_status = 'in_progress', started_at = NOW()
        WHERE pool_group_id = ?
    ");
    $stmt2->execute([$data['pool_group_id']]);

    $conn->commit();
    Response::success(null, 'Viagem iniciada com sucesso.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro: ' . $e->getMessage(), 500);
}
