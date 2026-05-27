<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/NearbyRideHelper.php';

$payload = AuthHelper::requireAuth();
$conn = Database::getInstance()->getConnection();
$driverId = AuthHelper::requireApprovedDriver($conn, $payload);

$driverStmt = $conn->prepare('
    SELECT vehicle_type, current_lat, current_lng, updated_at
    FROM drivers
    WHERE id = ?
');
$driverStmt->execute([$driverId]);
$driver = $driverStmt->fetch(PDO::FETCH_ASSOC);

if (!$driver) {
    Response::error('Motorista não encontrado', 404);
}

$driverLocation = NearbyRideHelper::driverLocation($driver);
if ($driverLocation === null) {
    Response::success([
        'rides' => [],
        'location_required' => true,
        'pickup_radius_km' => NearbyRideHelper::PICKUP_RADIUS_KM,
    ], 'Atualize a localização para ver pedidos próximos', 200);
}

$stmt = $conn->prepare("
    SELECT id, status, origin_address, destination_address,
           origin_lat, origin_lng, destination_lat, destination_lng,
           distance_km, duration_minutes, fare_final
    FROM rides
    WHERE ride_type = 'individual'
      AND status = 'pending'
      AND driver_id IS NULL
      AND vehicle_type = ?
    ORDER BY created_at DESC
    LIMIT 50
");
$stmt->execute([$driver['vehicle_type']]);

$rides = [];

foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $ride) {
    $distanceToPickup = NearbyRideHelper::distanceToPickup($driverLocation, $ride);
    if ($distanceToPickup > NearbyRideHelper::PICKUP_RADIUS_KM) {
        continue;
    }

    $rides[] = [
        'id' => (int) $ride['id'],
        'ride_type' => 'individual',
        'status' => $ride['status'],
        'current_count' => 1,
        'max_passengers' => 1,
        'origin_address' => $ride['origin_address'],
        'destination_address' => $ride['destination_address'],
        'origin_lat' => (float) $ride['origin_lat'],
        'origin_lng' => (float) $ride['origin_lng'],
        'destination_lat' => (float) $ride['destination_lat'],
        'destination_lng' => (float) $ride['destination_lng'],
        'distance_km' => $ride['distance_km'] !== null ? (float) $ride['distance_km'] : null,
        'duration_minutes' => $ride['duration_minutes'] !== null ? (int) $ride['duration_minutes'] : null,
        'fare_final' => $ride['fare_final'] !== null ? (float) $ride['fare_final'] : null,
        'distance_to_pickup_km' => round($distanceToPickup, 2),
        'route' => null,
    ];
}

usort($rides, static fn(array $a, array $b): int => $a['distance_to_pickup_km'] <=> $b['distance_to_pickup_km']);

Response::success([
    'rides' => array_slice($rides, 0, 15),
    'location_required' => false,
    'pickup_radius_km' => NearbyRideHelper::PICKUP_RADIUS_KM,
], 'Corridas individuais disponíveis', 200);
