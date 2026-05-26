<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['ride_id'])) {
    Response::error('ID da corrida em falta', 422);
}

$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$driverStmt = $conn->prepare('SELECT vehicle_type FROM drivers WHERE id = ?');
$driverStmt->execute([$driverId]);
$vehicleType = $driverStmt->fetchColumn();

$conn->beginTransaction();

try {
    $stmt = $conn->prepare("
        UPDATE rides
        SET driver_id = ?, status = 'accepted', accepted_at = NOW()
        WHERE id = ?
          AND ride_type = 'individual'
          AND status = 'pending'
          AND driver_id IS NULL
          AND vehicle_type = ?
    ");
    $stmt->execute([$driverId, $data['ride_id'], $vehicleType]);

    if ($stmt->rowCount() === 0) {
        throw new Exception('Corrida já atribuída ou indisponível.');
    }

    $conn->commit();
    Response::success(null, 'Corrida aceite com sucesso. Dirija-se ao passageiro.', 200);
} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao aceitar corrida: ' . $e->getMessage(), 500);
}
