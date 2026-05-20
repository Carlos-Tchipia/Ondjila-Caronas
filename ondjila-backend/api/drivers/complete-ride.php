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

    // Encontrar os dados da viagem antes de a fechar
    $stmtRides = $conn->prepare("SELECT id, passenger_id, fare_final FROM rides WHERE pool_group_id = ? AND status = 'in_progress'");
    $stmtRides->execute([$data['pool_group_id']]);
    $rides = $stmtRides->fetchAll(PDO::FETCH_ASSOC);

    // Atualizar status
    $stmt1 = $conn->prepare("UPDATE pool_groups SET status = 'completed', completed_at = NOW() WHERE id = ? AND driver_id = ? AND status = 'in_progress'");
    $stmt1->execute([$data['pool_group_id'], $driverId]);

    if ($stmt1->rowCount() === 0) {
        throw new Exception("Pool Group não encontrado ou não está em curso.");
    }

    $stmt2 = $conn->prepare("UPDATE rides SET status = 'completed', pool_status = 'delivered', completed_at = NOW() WHERE pool_group_id = ?");
    $stmt2->execute([$data['pool_group_id']]);

    // PROCESSAMENTO DA CARTEIRA VIRTUAL (ACID)
    $totalEarnedByDriver = 0;

    foreach ($rides as $ride) {
        $fare = $ride['fare_final'];
        if ($fare > 0) {
            // 1. Subtrair ao passageiro
            $conn->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?")->execute([$fare, $ride['passenger_id']]);
            // Registar transação do passageiro
            $conn->prepare("INSERT INTO transactions (user_id, ride_id, type, amount, balance_after, description) VALUES (?, ?, 'ride_payment', ?, (SELECT wallet_balance FROM users WHERE id = ?), 'Pagamento de Carona')")
                 ->execute([$ride['passenger_id'], $ride['id'], -$fare, $ride['passenger_id']]);
            
            $totalEarnedByDriver += $fare;
        }
    }

    if ($totalEarnedByDriver > 0) {
        // 2. Adicionar ao motorista
        // Buscar o user_id associado ao motorista
        $conn->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?")->execute([$totalEarnedByDriver, $payload->sub]);
        
        // Registar transação do motorista
        $conn->prepare("INSERT INTO transactions (user_id, ride_id, type, amount, balance_after, description) VALUES (?, NULL, 'pool_share', ?, (SELECT wallet_balance FROM users WHERE id = ?), 'Receita de Pool de Caronas')")
             ->execute([$payload->sub, $totalEarnedByDriver, $payload->sub]);
    }

    $conn->commit();
    Response::success(null, 'Viagem concluída com sucesso. Fundos transferidos.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro: ' . $e->getMessage(), 500);
}
