<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$data = json_decode(file_get_contents('php://input'), true) ?: [];

$amount = isset($data['amount']) ? (float) $data['amount'] : 0;
$method = $data['method'] ?? 'multicaixa';

if ($amount < 100 || $amount > 500000) {
    Response::error('Informe um valor entre 100 AOA e 500.000 AOA', 422);
}

if (!in_array($method, ['multicaixa', 'bank_transfer'], true)) {
    Response::error('Método de carregamento inválido', 422);
}

$conn = Database::getInstance()->getConnection();
$conn->beginTransaction();

try {
    $stmt = $conn->prepare('SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE');
    $stmt->execute([$payload->sub]);
    $currentBalance = $stmt->fetchColumn();

    if ($currentBalance === false) {
        throw new Exception('Utilizador não encontrado.');
    }

    $newBalance = (float) $currentBalance + $amount;

    $conn->prepare('UPDATE users SET wallet_balance = ? WHERE id = ?')
        ->execute([$newBalance, $payload->sub]);

    $description = $method === 'bank_transfer'
        ? 'Carregamento simulado por transferência bancária'
        : 'Carregamento simulado por Multicaixa Express';

    $conn->prepare("
        INSERT INTO transactions (user_id, ride_id, type, amount, balance_after, description)
        VALUES (?, NULL, 'top_up', ?, ?, ?)
    ")->execute([$payload->sub, $amount, $newBalance, $description]);

    $conn->commit();

    Response::success([
        'amount' => $amount,
        'balance' => $newBalance,
        'method' => $method,
    ], 'Carteira carregada com sucesso.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao carregar carteira: ' . $e->getMessage(), 500);
}
