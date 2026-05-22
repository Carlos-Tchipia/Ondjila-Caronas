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
    $stmtRides = $conn->prepare("SELECT id, passenger_id, fare_final FROM rides WHERE pool_group_id = ? AND status = 'in_progress'");
    $stmtRides->execute([$data['pool_group_id']]);
    $rides = $stmtRides->fetchAll(PDO::FETCH_ASSOC);

    $stmt1 = $conn->prepare("UPDATE pool_groups SET status = 'completed', completed_at = NOW() WHERE id = ? AND driver_id = ? AND status = 'in_progress'");
    $stmt1->execute([$data['pool_group_id'], $driverId]);

    if ($stmt1->rowCount() === 0) {
        throw new Exception("Pool Group não encontrado ou não está em curso.");
    }

    $stmt2 = $conn->prepare("UPDATE rides SET status = 'completed', pool_status = 'delivered', completed_at = NOW() WHERE pool_group_id = ?");
    $stmt2->execute([$data['pool_group_id']]);

    $totalEarnedByDriver = 0;

    foreach ($rides as $ride) {
        $fare = (float) $ride['fare_final'];
        if ($fare > 0) {
            $stmtBalance = $conn->prepare("SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE");
            $stmtBalance->execute([$ride['passenger_id']]);
            $passengerBalance = (float) $stmtBalance->fetchColumn();

            if ($passengerBalance < $fare) {
                throw new Exception("Passageiro sem saldo suficiente para concluir a viagem.");
            }

            $conn->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?")->execute([$fare, $ride['passenger_id']]);
            $conn->prepare("INSERT INTO transactions (user_id, ride_id, type, amount, balance_after, description) VALUES (?, ?, 'ride_payment', ?, (SELECT wallet_balance FROM users WHERE id = ?), 'Pagamento de Carona')")
                 ->execute([$ride['passenger_id'], $ride['id'], -$fare, $ride['passenger_id']]);

            $totalEarnedByDriver += $fare;
        }
    }

    if ($totalEarnedByDriver > 0) {
        $conn->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?")->execute([$totalEarnedByDriver, $payload->sub]);

        $conn->prepare("INSERT INTO transactions (user_id, ride_id, type, amount, balance_after, description) VALUES (?, NULL, 'pool_share', ?, (SELECT wallet_balance FROM users WHERE id = ?), 'Receita de Pool de Caronas')")
             ->execute([$payload->sub, $totalEarnedByDriver, $payload->sub]);
    }

    $conn->commit();
    Response::success(null, 'Viagem concluída com sucesso. Fundos transferidos.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro: ' . $e->getMessage(), 500);
}
