<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../models/UserModel.php';
require_once '../../config/jwt.php';

$data = json_decode(file_get_contents('php://input'), true);

$errors = Validator::validate($data ?: [], [
    'name'     => 'required',
    'email'    => 'required|email',
    'phone'    => 'required',
    'password' => 'required'
]);

if (!empty($errors)) {
    Response::error('Dados inválidos', 422, $errors);
}

$conn = Database::getInstance()->getConnection();
$userModel = new UserModel();

// Verificar se email ou telefone já existem
$stmt = $conn->prepare("SELECT id FROM users WHERE email = :email OR phone = :phone LIMIT 1");
$stmt->execute([':email' => $data['email'], ':phone' => $data['phone']]);
if ($stmt->fetch()) {
    Response::error('Email ou número de telefone já estão em uso.', 409);
}

$passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);

// Inserir na BD
$insert = $conn->prepare("
    INSERT INTO users (name, email, phone, password_hash, role) 
    VALUES (:name, :email, :phone, :password_hash, 'passenger')
");

try {
    $insert->execute([
        ':name' => $data['name'],
        ':email' => $data['email'],
        ':phone' => $data['phone'],
        ':password_hash' => $passwordHash
    ]);
    
    $userId = $conn->lastInsertId();

    // Auto-login após registo
    $accessToken = JwtHelper::generateToken([
        'sub'  => $userId,
        'role' => 'passenger',
        'type' => 'access'
    ]);

    Response::success([
        'access_token' => $accessToken,
        'user' => [
            'id'    => $userId,
            'name'  => $data['name'],
            'email' => $data['email'],
            'role'  => 'passenger'
        ]
    ], 'Conta criada com sucesso', 201);

} catch (PDOException $e) {
    Response::error('Erro ao criar conta', 500);
}
