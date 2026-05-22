<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';

$payload = AuthHelper::requireAuth();
$conn = Database::getInstance()->getConnection();
AuthHelper::requireApprovedDriver($conn, $payload);

$query = "
    SELECT pg.id, pg.status, pg.current_count, pg.max_passengers,
           MIN(r.origin_address) as origin_address,
           MIN(r.destination_address) as destination_address,
           MIN(r.origin_lat) as origin_lat,
           MIN(r.origin_lng) as origin_lng,
           MIN(r.destination_lat) as destination_lat,
           MIN(r.destination_lng) as destination_lng
    FROM pool_groups pg
    JOIN rides r ON r.pool_group_id = pg.id
    WHERE pg.status = 'forming' AND pg.current_count < pg.max_passengers AND pg.driver_id IS NULL
    GROUP BY pg.id
    ORDER BY pg.created_at DESC
    LIMIT 15
";

$stmt = $conn->prepare($query);
$stmt->execute();
$pools = $stmt->fetchAll(PDO::FETCH_ASSOC);

Response::success(['pools' => $pools], 'Pools disponíveis', 200);
