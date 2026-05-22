<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../config/jwt.php';

$headers = apache_request_headers();
if (!isset($headers['Authorization'])) Response::error('Não autorizado', 401);

$token = str_replace('Bearer ', '', $headers['Authorization']);
$payload = JwtHelper::decodeToken($token);

if (!$payload || $payload->role !== 'passenger') {
    Response::error('Token inválido ou não é passageiro', 401);
}

$conn = Database::getInstance()->getConnection();
$conn->beginTransaction();

try {
    // Procurar corrida pendente ou aceite deste passageiro
    $stmt = $conn->prepare("SELECT id, pool_group_id, status FROM rides WHERE passenger_id = ? AND status IN ('pending', 'accepted') LIMIT 1");
    $stmt->execute([$payload->sub]);
    $ride = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ride) {
        throw new Exception("Nenhuma carona ativa para cancelar.");
    }

    $poolGroupId = $ride['pool_group_id'];

    // 1. Cancelar a corrida do passageiro
    $conn->prepare("UPDATE rides SET status = 'cancelled', pool_status = NULL, cancelled_at = NOW() WHERE id = ?")->execute([$ride['id']]);

    // 2. Atualizar o Pool Group
    // Se era o único passageiro (ou o criador do grupo forming)
    $stmtGroup = $conn->prepare("SELECT current_count, status FROM pool_groups WHERE id = ?");
    $stmtGroup->execute([$poolGroupId]);
    $group = $stmtGroup->fetch(PDO::FETCH_ASSOC);

    if ($group && $group['current_count'] <= 1 && $group['status'] === 'forming') {
        // Cancelar o grupo inteiro se era o único a formar
        $conn->prepare("UPDATE pool_groups SET status = 'cancelled' WHERE id = ?")->execute([$poolGroupId]);
    } elseif ($group && $group['current_count'] > 0) {
        // Reduzir contagem de passageiros
        $conn->prepare("UPDATE pool_groups SET current_count = current_count - 1 WHERE id = ?")->execute([$poolGroupId]);
        
        // Se o grupo ficar vazio (em qualquer estado), cancelar
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
