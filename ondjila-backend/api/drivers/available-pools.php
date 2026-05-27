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
        'pools' => [],
        'location_required' => true,
        'pickup_radius_km' => NearbyRideHelper::PICKUP_RADIUS_KM,
    ], 'Atualize a localização para ver pedidos próximos', 200);
}

$query = "
    SELECT pg.id, pg.status, pg.current_count, pg.max_passengers, pg.created_at,
           pg.vehicle_type, pg.route_data,
           r.origin_address, r.destination_address,
           r.origin_lat, r.origin_lng, r.destination_lat, r.destination_lng,
           r.pickup_order
    FROM pool_groups pg
    JOIN rides r ON r.pool_group_id = pg.id
    WHERE pg.status = 'forming'
      AND pg.current_count < pg.max_passengers
      AND pg.driver_id IS NULL
      AND pg.vehicle_type = ?
      AND r.status = 'pending'
    ORDER BY pg.created_at DESC, r.pickup_order ASC, r.id ASC
    LIMIT 200
";

$stmt = $conn->prepare($query);
$stmt->execute([$driver['vehicle_type']]);
$pools = [];

foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $pool) {
    $poolId = (int) $pool['id'];

    if (isset($pools[$poolId])) {
        continue;
    }

    $distanceToPickup = NearbyRideHelper::distanceToPickup($driverLocation, $pool);
    if ($distanceToPickup > NearbyRideHelper::PICKUP_RADIUS_KM) {
        continue;
    }

    $route = $pool['route_data'] ? json_decode($pool['route_data'], true) : null;
    unset($pool['route_data']);
    unset($pool['created_at']);
    unset($pool['pickup_order']);

    $pools[$poolId] = [
        ...$pool,
        'id' => $poolId,
        'ride_type' => 'pool',
        'current_count' => (int) $pool['current_count'],
        'max_passengers' => (int) $pool['max_passengers'],
        'origin_lat' => (float) $pool['origin_lat'],
        'origin_lng' => (float) $pool['origin_lng'],
        'destination_lat' => (float) $pool['destination_lat'],
        'destination_lng' => (float) $pool['destination_lng'],
        'distance_to_pickup_km' => round($distanceToPickup, 2),
        'route' => $route,
    ];
}

$pools = array_values($pools);
usort($pools, static fn(array $a, array $b): int => $a['distance_to_pickup_km'] <=> $b['distance_to_pickup_km']);

Response::success([
    'pools' => array_slice($pools, 0, 15),
    'location_required' => false,
    'pickup_radius_km' => NearbyRideHelper::PICKUP_RADIUS_KM,
], 'Pools disponíveis', 200);
