<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$data = json_decode(file_get_contents('php://input'), true);

$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$conn->beginTransaction();

try {
    if (isset($data['ride_id'])) {
        $stmtRide = $conn->prepare("
            SELECT id, passenger_id
            FROM rides
            WHERE id = ?
              AND driver_id = ?
              AND ride_type = 'individual'
              AND status = 'in_progress'
            FOR UPDATE
        ");
        $stmtRide->execute([$data['ride_id'], $driverId]);
        $ride = $stmtRide->fetch(PDO::FETCH_ASSOC);

        if (!$ride) {
            throw new Exception('Corrida individual não encontrada ou não está em curso.');
        }

        $conn->prepare("
            UPDATE rides
            SET status = 'completed',
                is_paid = 0,
                payment_method = NULL,
                completed_at = NOW()
            WHERE id = ?
        ")->execute([$ride['id']]);

        $conn->prepare("
            UPDATE rides
            SET status = 'cancelled',
                cancelled_at = NOW(),
                cancellation_reason = 'Cancelada automaticamente após conclusão de outra viagem'
            WHERE passenger_id = ?
              AND id <> ?
              AND status = 'pending'
              AND driver_id IS NULL
        ")->execute([$ride['passenger_id'], $ride['id']]);

        $conn->commit();
        Response::success(null, 'Viagem concluída. Aguardando pagamento do passageiro.', 200);
    }

    if (!isset($data['pool_group_id'])) {
        Response::error('ID da viagem em falta', 422);
    }

    $stmtRides = $conn->prepare("SELECT id, passenger_id FROM rides WHERE pool_group_id = ? AND status = 'in_progress'");
    $stmtRides->execute([$data['pool_group_id']]);
    $rides = $stmtRides->fetchAll(PDO::FETCH_ASSOC);

    $stmt1 = $conn->prepare("UPDATE pool_groups SET status = 'completed', completed_at = NOW() WHERE id = ? AND driver_id = ? AND status = 'in_progress'");
    $stmt1->execute([$data['pool_group_id'], $driverId]);

    if ($stmt1->rowCount() === 0) {
        throw new Exception('Pool Group não encontrado ou não está em curso.');
    }

    $conn->prepare("
        UPDATE rides
        SET status = 'completed',
            pool_status = 'delivered',
            is_paid = 0,
            payment_method = NULL,
            completed_at = NOW()
        WHERE pool_group_id = ?
    ")->execute([$data['pool_group_id']]);

    foreach ($rides as $ride) {
        $conn->prepare("
            UPDATE rides
            SET status = 'cancelled',
                cancelled_at = NOW(),
                cancellation_reason = 'Cancelada automaticamente após conclusão de outra viagem'
            WHERE passenger_id = ?
              AND id <> ?
              AND status = 'pending'
              AND driver_id IS NULL
        ")->execute([$ride['passenger_id'], $ride['id']]);
    }

    $conn->commit();
    Response::success(null, 'Viagem concluída. Aguardando pagamento dos passageiros.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro: ' . $e->getMessage(), 500);
}
