<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';

$data = json_decode(file_get_contents('php://input'), true);

$errors = Validator::validate($data ?: [], [
    'email' => 'required|email',
    'code' => 'required',
    'new_password' => 'required'
]);

if (!empty($errors)) {
    Response::error('Dados invalidos', 422, $errors);
}

$email = strtolower(trim($data['email']));
$code = trim((string) $data['code']);
$newPassword = (string) $data['new_password'];

if (strlen($newPassword) < 8) {
    Response::error('A nova senha deve ter pelo menos 8 caracteres.', 422, [
        'new_password' => ['A nova senha deve ter pelo menos 8 caracteres.']
    ]);
}

if (!preg_match('/^\d{6}$/', $code)) {
    Response::error('Codigo de recuperacao invalido.', 422, [
        'code' => ['Informe o codigo de 6 digitos.']
    ]);
}

$conn = Database::getInstance()->getConnection();

$stmt = $conn->prepare("
    SELECT id, is_active
    FROM users
    WHERE email = :email
      AND otp_code = :code
      AND otp_expires_at IS NOT NULL
      AND otp_expires_at > CURRENT_TIMESTAMP
    LIMIT 1
");

$stmt->execute([
    ':email' => $email,
    ':code' => $code,
]);

$user = $stmt->fetch();

if (!$user) {
    Response::error('Codigo invalido ou expirado.', 400);
}

if (!$user['is_active']) {
    Response::error('Conta suspensa ou inativa', 403);
}

$passwordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

$update = $conn->prepare("
    UPDATE users
    SET password_hash = :password_hash,
        otp_code = NULL,
        otp_expires_at = NULL
    WHERE id = :id
");

$update->execute([
    ':password_hash' => $passwordHash,
    ':id' => $user['id'],
]);

Response::success(null, 'Senha redefinida com sucesso');
