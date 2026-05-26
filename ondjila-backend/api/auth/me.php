<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$conn = Database::getInstance()->getConnection();

$stmt = $conn->prepare('
    SELECT id, name, email, role, avatar_url, is_active
    FROM users
    WHERE id = ?
    LIMIT 1
');
$stmt->execute([$payload->sub]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !(bool) $user['is_active']) {
    Response::error('Conta inativa ou sessão inválida', 401);
}

$effectiveRole = AuthHelper::resolveLoginRole($conn, $user);

Response::success([
    'user' => [
        'id' => (int) $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $effectiveRole,
        'avatar_url' => $user['avatar_url'],
    ],
], 'Sessão válida', 200);
