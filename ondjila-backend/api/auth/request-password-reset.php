<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';

$data = json_decode(file_get_contents('php://input'), true);

$errors = Validator::validate($data ?: [], [
    'email' => 'required|email'
]);

if (!empty($errors)) {
    Response::error('Dados invalidos', 422, $errors);
}

$email = strtolower(trim($data['email']));
$conn = Database::getInstance()->getConnection();

$stmt = $conn->prepare("SELECT id, is_active FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user) {
    Response::error('Nao existe nenhuma conta com este email.', 404);
}

if (!$user['is_active']) {
    Response::error('Conta suspensa ou inativa', 403);
}

$code = (string) random_int(100000, 999999);

$update = $conn->prepare("
    UPDATE users
    SET otp_code = :code,
        otp_expires_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 15 MINUTE)
    WHERE id = :id
");

$update->execute([
    ':code' => $code,
    ':id' => $user['id'],
]);

Response::success([
    'reset_code' => $code,
    'expires_in_minutes' => 15,
], 'Codigo de recuperacao gerado com sucesso');
