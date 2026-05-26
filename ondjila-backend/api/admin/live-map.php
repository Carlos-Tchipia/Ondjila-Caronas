<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
if (($payload->role ?? null) !== 'admin') {
    Response::error('Acesso restrito ao administrador', 403);
}

$conn = Database::getInstance()->getConnection();

$drivers = $conn->query("
    SELECT d.id, d.vehicle_brand, d.vehicle_model, d.vehicle_plate, d.vehicle_type,
           d.is_available, d.current_lat, d.current_lng, u.name
    FROM drivers d
    INNER JOIN users u ON u.id = d.user_id
    WHERE d.approval_status = 'approved'
    ORDER BY d.is_available DESC, d.id DESC
    LIMIT 100
")->fetchAll(PDO::FETCH_ASSOC);

$rides = $conn->query("
    SELECT r.id, r.ride_type, r.status, r.origin_address, r.destination_address,
           r.origin_lat, r.origin_lng, r.destination_lat, r.destination_lng,
           p.name AS passenger_name, du.name AS driver_name
    FROM rides r
    INNER JOIN users p ON p.id = r.passenger_id
    LEFT JOIN drivers d ON d.id = r.driver_id
    LEFT JOIN users du ON du.id = d.user_id
    WHERE r.status IN ('pending', 'accepted', 'in_progress')
    ORDER BY r.created_at DESC
    LIMIT 80
")->fetchAll(PDO::FETCH_ASSOC);

Response::success([
    'drivers' => array_map(static fn($driver) => [
        'id' => (int) $driver['id'],
        'name' => $driver['name'],
        'vehicle' => trim(($driver['vehicle_brand'] ?? '') . ' ' . ($driver['vehicle_model'] ?? '')),
        'vehicle_type' => $driver['vehicle_type'],
        'plate' => $driver['vehicle_plate'],
        'is_available' => (bool) $driver['is_available'],
        'current_lat' => $driver['current_lat'] !== null ? (float) $driver['current_lat'] : null,
        'current_lng' => $driver['current_lng'] !== null ? (float) $driver['current_lng'] : null,
    ], $drivers),
    'rides' => array_map(static fn($ride) => [
        'id' => (int) $ride['id'],
        'ride_type' => $ride['ride_type'],
        'status' => $ride['status'],
        'origin_address' => $ride['origin_address'],
        'destination_address' => $ride['destination_address'],
        'origin_lat' => (float) $ride['origin_lat'],
        'origin_lng' => (float) $ride['origin_lng'],
        'destination_lat' => (float) $ride['destination_lat'],
        'destination_lng' => (float) $ride['destination_lng'],
        'driver_name' => $ride['driver_name'],
        'passenger_name' => $ride['passenger_name'],
    ], $rides),
], 'Mapa operacional carregado', 200);
