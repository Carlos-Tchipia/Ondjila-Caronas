<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../config/jwt.php';

$headers = apache_request_headers();
if (!isset($headers['Authorization'])) Response::error('Não autorizado', 401);

$token = str_replace('Bearer ', '', $headers['Authorization']);
$payload = JwtHelper::decodeToken($token);

$conn = Database::getInstance()->getConnection();

// Buscar a viagem ativa do passageiro (pending, accepted, in_progress)
$query = "
    SELECT r.id, r.status, r.pool_group_id, r.pool_status,
           pg.driver_id, d.vehicle_brand, d.vehicle_model, d.vehicle_plate, d.vehicle_color,
           u.name as driver_name, u.avatar_url as driver_avatar
    FROM rides r
    LEFT JOIN pool_groups pg ON r.pool_group_id = pg.id
    LEFT JOIN drivers d ON pg.driver_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE r.passenger_id = ? AND r.status IN ('pending', 'accepted', 'in_progress')
    ORDER BY r.created_at DESC
    LIMIT 1
";

$stmt = $conn->prepare($query);
$stmt->execute([$payload->sub]);
$currentRide = $stmt->fetch(PDO::FETCH_ASSOC);

if ($currentRide) {
    Response::success(['ride' => $currentRide], 'Viagem encontrada', 200);
} else {
    Response::success(['ride' => null], 'Nenhuma viagem ativa', 200);
}
