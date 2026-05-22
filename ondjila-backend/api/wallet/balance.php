<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();

$conn = Database::getInstance()->getConnection();

$stmt = $conn->prepare("SELECT wallet_balance FROM users WHERE id = ?");
$stmt->execute([$payload->sub]);
$balance = $stmt->fetchColumn();

if ($balance !== false) {
    Response::success(['balance' => $balance], 'Saldo obtido com sucesso', 200);
} else {
    Response::error('Utilizador não encontrado', 404);
}
