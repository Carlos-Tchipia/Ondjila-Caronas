<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../config/jwt.php';

$headers = apache_request_headers();
if (!isset($headers['Authorization'])) {
    Response::error('Não autorizado', 401);
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$payload = JwtHelper::decodeToken($token);

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['pool_group_id'])) {
    Response::error('ID do Pool Group em falta', 422);
}

$conn = Database::getInstance()->getConnection();

$conn->beginTransaction();

try {
    // Buscar id do motorista na tabela drivers
    $stmtDriver = $conn->prepare("SELECT id FROM drivers WHERE user_id = ?");
    $stmtDriver->execute([$payload->sub]);
    $driverRow = $stmtDriver->fetch();
    
    // Se não existir, erro
    if (!$driverRow) {
        throw new Exception("Conta não está registada como motorista.");
    }

    $driverId = $driverRow['id'];

    // Atualizar o pool group para ter motorista e mudar status para active
    $updateGroup = $conn->prepare("UPDATE pool_groups SET driver_id = ?, status = 'active' WHERE id = ?");
    $updateGroup->execute([$driverId, $data['pool_group_id']]);

    // Atualizar todas as rides daquele pool para indicar que foram aceites
    $updateRides = $conn->prepare("UPDATE rides SET status = 'accepted', pool_status = 'matched' WHERE pool_group_id = ?");
    $updateRides->execute([$data['pool_group_id']]);

    $conn->commit();
    Response::success(null, 'Viagem aceite com sucesso. Dirija-se ao local de encontro.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao aceitar viagem: ' . $e->getMessage(), 500);
}
