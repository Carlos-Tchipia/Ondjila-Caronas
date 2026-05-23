<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/FileUpload.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../config/jwt.php';

$data = $_POST;

$errors = Validator::validate($data, [
    'name'           => 'required',
    'email'          => 'required|email',
    'phone'          => 'required',
    'password'       => 'required',
    'license_number' => 'required',
    'vehicle_plate'  => 'required',
    'vehicle_type'   => 'required|in:economy,comfort,xl',
]);

if (!empty($errors)) {
    Response::error('Dados inválidos', 422, $errors);
}

$requiredDocs = ['doc_license_front', 'doc_license_back', 'doc_insurance', 'doc_id_card'];
foreach ($requiredDocs as $doc) {
    if (!isset($_FILES[$doc]) || $_FILES[$doc]['error'] !== UPLOAD_ERR_OK) {
        Response::error("O documento {$doc} é obrigatório.", 422);
    }
}

$conn = Database::getInstance()->getConnection();

$stmt = $conn->prepare("SELECT id FROM users WHERE email = :email OR phone = :phone LIMIT 1");
$stmt->execute([':email' => $data['email'], ':phone' => $data['phone']]);
if ($stmt->fetch()) {
    Response::error('Email ou número de telefone já estão em uso.', 409);
}

$stmt = $conn->prepare("SELECT id FROM drivers WHERE license_number = :license OR vehicle_plate = :plate LIMIT 1");
$stmt->execute([':license' => $data['license_number'], ':plate' => $data['vehicle_plate']]);
if ($stmt->fetch()) {
    Response::error('Carta de condução ou matrícula já estão registadas.', 409);
}

$conn->beginTransaction();

try {
    $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
    $insertUser = $conn->prepare("
        INSERT INTO users (name, email, phone, password_hash, role)
        VALUES (:name, :email, :phone, :password_hash, 'driver')
    ");
    $insertUser->execute([
        ':name' => $data['name'],
        ':email' => $data['email'],
        ':phone' => $data['phone'],
        ':password_hash' => $passwordHash,
    ]);
    $userId = (int) $conn->lastInsertId();

    $uploadDir = __DIR__ . '/../../uploads/documents';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $docPaths = [];
    foreach ($requiredDocs as $doc) {
        $docPaths[$doc] = FileUpload::upload($_FILES[$doc], $uploadDir);
    }

    $insertDriver = $conn->prepare("
        INSERT INTO drivers (
            user_id, license_number, vehicle_brand, vehicle_model, vehicle_year, vehicle_plate,
            vehicle_color, vehicle_type, vehicle_is_electric, pool_enabled, pool_max_passengers,
            doc_license_front, doc_license_back, doc_insurance, doc_id_card, approval_status
        ) VALUES (
            :user_id, :license_number, :brand, :model, :year, :plate, :color, :type,
            :is_electric, :pool_enabled, :pool_max, :doc_front, :doc_back, :doc_ins, :doc_id, 'approved'
        )
    ");

    $insertDriver->execute([
        ':user_id'        => $userId,
        ':license_number' => $data['license_number'],
        ':brand'          => $data['vehicle_brand'] ?? null,
        ':model'          => $data['vehicle_model'] ?? null,
        ':year'           => $data['vehicle_year'] ?? null,
        ':plate'          => $data['vehicle_plate'],
        ':color'          => $data['vehicle_color'] ?? null,
        ':type'           => $data['vehicle_type'],
        ':is_electric'    => ($data['vehicle_is_electric'] ?? '') === 'true' ? 1 : 0,
        ':pool_enabled'   => ($data['pool_enabled'] ?? 'true') === 'true' ? 1 : 0,
        ':pool_max'       => $data['pool_max_passengers'] ?? 2,
        ':doc_front'      => $docPaths['doc_license_front'],
        ':doc_back'       => $docPaths['doc_license_back'],
        ':doc_ins'        => $docPaths['doc_insurance'],
        ':doc_id'         => $docPaths['doc_id_card'],
    ]);

    $conn->commit();

    $userRow = ['id' => $userId, 'role' => 'driver'];
    $effectiveRole = AuthHelper::resolveLoginRole($conn, $userRow);

    $accessToken = JwtHelper::generateToken([
        'sub'  => $userId,
        'role' => $effectiveRole,
        'type' => 'access',
    ], 3600);

    Response::success([
        'access_token' => $accessToken,
        'user' => [
            'id'    => $userId,
            'name'  => $data['name'],
            'email' => $data['email'],
            'role'  => $effectiveRole,
        ],
    ], 'Conta de motorista criada com sucesso.', 201);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao registar motorista.', 500);
}
