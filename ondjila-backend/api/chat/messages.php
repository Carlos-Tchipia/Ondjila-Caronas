<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$conn = Database::getInstance()->getConnection();
$rideId = isset($_GET['ride_id']) ? (int) $_GET['ride_id'] : null;

$conn->exec("
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ride_id INT NOT NULL,
        sender_id INT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        INDEX idx_ride (ride_id)
    )
");

function resolveChatRide(PDO $conn, int $userId, ?int $rideId = null): ?array
{
    $sql = "
        SELECT r.id, r.status, r.ride_type,
               passenger.name AS passenger_name,
               driver_user.name AS driver_name
        FROM rides r
        INNER JOIN users passenger ON passenger.id = r.passenger_id
        LEFT JOIN drivers d ON d.id = r.driver_id
        LEFT JOIN users driver_user ON driver_user.id = d.user_id
        WHERE (r.passenger_id = ? OR d.user_id = ?)
          AND r.status IN ('accepted', 'in_progress')
    ";
    $params = [$userId, $userId];

    if ($rideId) {
        $sql .= " AND r.id = ?";
        $params[] = $rideId;
    }

    $sql .= " ORDER BY COALESCE(r.accepted_at, r.created_at) DESC, r.id DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $ride = $stmt->fetch(PDO::FETCH_ASSOC);

    return $ride ?: null;
}

$ride = resolveChatRide($conn, (int) $payload->sub, $rideId);

if (!$ride) {
    Response::success([
        'ride' => null,
        'messages' => [],
    ], 'Nenhum chat ativo encontrado', 200);
}

$stmt = $conn->prepare("
    SELECT cm.id, cm.ride_id, cm.sender_id, cm.message, cm.created_at,
           u.name AS sender_name, u.role AS sender_role
    FROM chat_messages cm
    INNER JOIN users u ON u.id = cm.sender_id
    WHERE cm.ride_id = ?
    ORDER BY cm.created_at ASC, cm.id ASC
");
$stmt->execute([(int) $ride['id']]);
$messages = array_map(static function (array $row) use ($payload): array {
    $createdAt = strtotime($row['created_at']);
    return [
        'id' => (int) $row['id'],
        'ride_id' => (int) $row['ride_id'],
        'sender_id' => (int) $row['sender_id'],
        'sender_name' => $row['sender_name'] ?: 'Utilizador',
        'sender_role' => $row['sender_role'] ?: 'passenger',
        'message' => $row['message'],
        'mine' => (int) $row['sender_id'] === (int) $payload->sub,
        'created_at' => $row['created_at'],
        'time' => $createdAt ? date('H:i', $createdAt) : '',
    ];
}, $stmt->fetchAll(PDO::FETCH_ASSOC));

Response::success([
    'ride' => [
        'id' => (int) $ride['id'],
        'status' => $ride['status'],
        'ride_type' => $ride['ride_type'],
        'driver_name' => $ride['driver_name'],
        'passenger_name' => $ride['passenger_name'],
    ],
    'messages' => $messages,
], 'Mensagens carregadas', 200);
