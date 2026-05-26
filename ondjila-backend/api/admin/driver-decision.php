<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/AdminAnalyticsService.php';

$payload = AuthHelper::requireAuth();
if (($payload->role ?? null) !== 'admin') {
    Response::error('Acesso restrito ao administrador', 403);
}

$data = json_decode(file_get_contents('php://input'), true) ?: [];
$driverId = isset($data['driver_id']) ? (int) $data['driver_id'] : 0;
$action = $data['action'] ?? '';

$statusMap = [
    'approve' => 'approved',
    'reject' => 'rejected',
    'suspend' => 'suspended',
    'reactivate' => 'approved',
];

if ($driverId <= 0 || !isset($statusMap[$action])) {
    Response::error('Decisão administrativa inválida', 422);
}

$conn = Database::getInstance()->getConnection();
$conn->beginTransaction();

try {
    $stmt = $conn->prepare('SELECT id, user_id FROM drivers WHERE id = ? FOR UPDATE');
    $stmt->execute([$driverId]);
    $driver = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$driver) {
        throw new Exception('Motorista não encontrado.');
    }

    $newStatus = $statusMap[$action];
    $isAvailable = $newStatus === 'approved' ? 1 : 0;

    $conn->prepare("
        UPDATE drivers
        SET approval_status = ?,
            is_available = ?,
            is_accepting_pool = CASE WHEN ? = 'approved' THEN is_accepting_pool ELSE 0 END
        WHERE id = ?
    ")->execute([$newStatus, $isAvailable, $newStatus, $driverId]);

    $conn->prepare("
        INSERT INTO notifications (user_id, title, body, type, data)
        VALUES (?, ?, ?, 'system', ?)
    ")->execute([
        $driver['user_id'],
        'Validação de motorista',
        match ($newStatus) {
            'approved' => 'A sua conta de motorista foi aprovada.',
            'rejected' => 'A sua candidatura de motorista foi rejeitada.',
            'suspended' => 'A sua conta de motorista foi suspensa.',
            default => 'O estado da sua conta de motorista foi atualizado.',
        },
        json_encode(['driver_id' => $driverId, 'status' => $newStatus], JSON_UNESCAPED_UNICODE),
    ]);

    $conn->commit();

    $driversPayload = AdminAnalyticsService::drivers($conn);
    $updatedDriver = null;
    foreach ($driversPayload['drivers'] as $item) {
        if ((int) $item['id'] === $driverId) {
            $updatedDriver = $item;
            break;
        }
    }

    Response::success([
        'driver' => $updatedDriver,
        'summary' => $driversPayload['summary'],
    ], 'Estado do motorista atualizado.', 200);

} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao atualizar motorista: ' . $e->getMessage(), 500);
}
