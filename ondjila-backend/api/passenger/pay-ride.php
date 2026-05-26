<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$data = json_decode(file_get_contents('php://input'), true);

$rideId = isset($data['ride_id']) ? (int) $data['ride_id'] : 0;
$method = $data['payment_method'] ?? '';
$allowedMethods = ['wallet', 'multicaixa', 'cash'];

if ($rideId <= 0 || !in_array($method, $allowedMethods, true)) {
    Response::error('Método de pagamento inválido', 422);
}

$conn = Database::getInstance()->getConnection();
$conn->beginTransaction();

try {
    $stmtRide = $conn->prepare("
        SELECT r.id, r.passenger_id, r.driver_id, r.fare_final, r.is_paid,
               d.user_id AS driver_user_id
        FROM rides r
        LEFT JOIN drivers d ON d.id = r.driver_id
        WHERE r.id = ?
          AND r.passenger_id = ?
          AND r.status = 'completed'
        FOR UPDATE
    ");
    $stmtRide->execute([$rideId, $payload->sub]);
    $ride = $stmtRide->fetch(PDO::FETCH_ASSOC);

    if (!$ride) {
        throw new Exception('Viagem concluída não encontrada.');
    }

    if ((int) $ride['is_paid'] === 1) {
        throw new Exception('Esta viagem já foi paga.');
    }

    $fare = (float) $ride['fare_final'];

    $stmtBalance = $conn->prepare('SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE');
    $stmtBalance->execute([$payload->sub]);
    $passengerBalance = (float) $stmtBalance->fetchColumn();

    if ($method === 'wallet') {
        if ($passengerBalance < $fare) {
            throw new Exception('Saldo insuficiente na carteira.');
        }

        $conn->prepare('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?')
            ->execute([$fare, $payload->sub]);
        $passengerBalanceAfter = $passengerBalance - $fare;
    } else {
        $passengerBalanceAfter = $passengerBalance;
    }

    $descriptions = [
        'wallet' => 'Pagamento de viagem por carteira',
        'multicaixa' => 'Pagamento simulado por transferência bancária',
        'cash' => 'Pagamento simulado em cash',
    ];

    $conn->prepare("
        INSERT INTO transactions (user_id, ride_id, type, amount, balance_after, description)
        VALUES (?, ?, 'ride_payment', ?, ?, ?)
    ")->execute([
        $payload->sub,
        $rideId,
        -$fare,
        $passengerBalanceAfter,
        $descriptions[$method],
    ]);

    if (!empty($ride['driver_user_id']) && in_array($method, ['wallet', 'multicaixa'], true)) {
        $conn->prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?')
            ->execute([$fare, $ride['driver_user_id']]);
        $conn->prepare("
            INSERT INTO transactions (user_id, ride_id, type, amount, balance_after, description)
            VALUES (?, ?, 'pool_share', ?, (SELECT wallet_balance FROM users WHERE id = ?), ?)
        ")->execute([
            $ride['driver_user_id'],
            $rideId,
            $fare,
            $ride['driver_user_id'],
            $method === 'wallet' ? 'Receita de viagem por carteira' : 'Receita simulada por transferência bancária',
        ]);
    }

    $conn->prepare('UPDATE rides SET is_paid = 1, payment_method = ? WHERE id = ?')
        ->execute([$method, $rideId]);

    $conn->commit();

    Response::success([
        'ride_id' => $rideId,
        'payment_method' => $method,
        'amount' => $fare,
        'wallet_balance' => $passengerBalanceAfter,
    ], 'Pagamento registado com sucesso.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao pagar viagem: ' . $e->getMessage(), 400);
}
