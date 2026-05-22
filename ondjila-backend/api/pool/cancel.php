<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();

$conn = Database::getInstance()->getConnection();
$conn->beginTransaction();

try {
    $stmt = $conn->prepare("SELECT id, pool_group_id, status FROM rides WHERE passenger_id = ? AND status IN ('pending', 'accepted') LIMIT 1");
    $stmt->execute([$payload->sub]);
    $ride = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ride) {
        throw new Exception("Nenhuma carona ativa para cancelar.");
    }

    $poolGroupId = $ride['pool_group_id'];

    $conn->prepare("UPDATE rides SET status = 'cancelled', pool_status = NULL, cancelled_at = NOW() WHERE id = ?")->execute([$ride['id']]);

    $stmtGroup = $conn->prepare("SELECT current_count, status FROM pool_groups WHERE id = ?");
    $stmtGroup->execute([$poolGroupId]);
    $group = $stmtGroup->fetch(PDO::FETCH_ASSOC);

    if ($group && $group['current_count'] <= 1 && $group['status'] === 'forming') {
        $conn->prepare("UPDATE pool_groups SET status = 'cancelled' WHERE id = ?")->execute([$poolGroupId]);
    } elseif ($group && $group['current_count'] > 0) {
        $conn->prepare("UPDATE pool_groups SET current_count = current_count - 1 WHERE id = ?")->execute([$poolGroupId]);

        if ($group['current_count'] - 1 == 0) {
            $conn->prepare("UPDATE pool_groups SET status = 'cancelled' WHERE id = ?")->execute([$poolGroupId]);
        }
    }

    $conn->commit();
    Response::success(null, 'Carona cancelada com sucesso.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao cancelar: ' . $e->getMessage(), 500);
}
