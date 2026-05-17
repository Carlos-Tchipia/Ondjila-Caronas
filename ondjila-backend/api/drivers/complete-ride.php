<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../config/jwt.php';

$headers = apache_request_headers();
if (!isset($headers['Authorization'])) Response::error('Não autorizado', 401);

$token = str_replace('Bearer ', '', $headers['Authorization']);
$payload = JwtHelper::decodeToken($token);

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['pool_group_id'])) Response::error('ID do Pool Group em falta', 422);

$conn = Database::getInstance()->getConnection();
$conn->beginTransaction();

try {
    // Verificar motorista
    $stmtDriver = $conn->prepare("SELECT id FROM drivers WHERE user_id = ?");
    $stmtDriver->execute([$payload->sub]);
    $driverId = $stmtDriver->fetchColumn();

    if (!$driverId) throw new Exception("Motorista inválido.");

    // Atualizar status
    $stmt1 = $conn->prepare("UPDATE pool_groups SET status = 'completed', completed_at = NOW() WHERE id = ? AND driver_id = ? AND status = 'in_progress'");
    $stmt1->execute([$data['pool_group_id'], $driverId]);

    if ($stmt1->rowCount() === 0) {
        throw new Exception("Pool Group não encontrado ou não está em curso.");
    }

    $stmt2 = $conn->prepare("UPDATE rides SET status = 'completed', pool_status = 'delivered', completed_at = NOW() WHERE pool_group_id = ?");
    $stmt2->execute([$data['pool_group_id']]);

    $conn->commit();
    Response::success(null, 'Viagem concluída com sucesso.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro: ' . $e->getMessage(), 500);
}
