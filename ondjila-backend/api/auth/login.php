<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../models/UserModel.php';
require_once '../../config/jwt.php';

$data = json_decode(file_get_contents('php://input'), true);

$errors = Validator::validate($data ?: [], [
    'email'    => 'required|email',
    'password' => 'required'
]);

if (!empty($errors)) {
    Response::error('Dados inválidos', 422, $errors);
}

$userModel = new UserModel();
$user = $userModel->findByEmail($data['email']);

if (!$user || !password_verify($data['password'], $user['password_hash'])) {
    Response::error('Email ou senha incorretos', 401);
}

if (!$user['is_active']) {
    Response::error('Conta suspensa ou inativa', 403);
}

$conn = Database::getInstance()->getConnection();
require_once '../../helpers/AuthHelper.php';
$effectiveRole = AuthHelper::resolveLoginRole($conn, $user);

// Gerar tokens
$accessToken = JwtHelper::generateToken([
    'sub'  => $user['id'],
    'role' => $effectiveRole,
    'type' => 'access'
], 3600); // 1 hora

// Atualizar último login
$userModel->updateLastLogin($user['id']);

// Resposta
Response::success([
    'access_token' => $accessToken,
    'user' => [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $effectiveRole,
        'avatar_url' => $user['avatar_url']
    ]
], 'Login efetuado com sucesso');
