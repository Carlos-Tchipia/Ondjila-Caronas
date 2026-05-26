<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$conn = Database::getInstance()->getConnection();

$stmt = $conn->prepare("
    SELECT id, ride_id, type, amount, balance_after, description, status, created_at
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 20
");
$stmt->execute([$payload->sub]);

$transactions = array_map(function (array $tx): array {
    return [
        'id' => (int) $tx['id'],
        'ride_id' => $tx['ride_id'] !== null ? (int) $tx['ride_id'] : null,
        'type' => $tx['type'],
        'amount' => (float) $tx['amount'],
        'balance_after' => (float) $tx['balance_after'],
        'description' => $tx['description'],
        'status' => $tx['status'],
        'created_at' => $tx['created_at'],
    ];
}, $stmt->fetchAll(PDO::FETCH_ASSOC));

Response::success(['transactions' => $transactions], 'Transações carregadas', 200);
