<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/PoolDetailsHelper.php';

$payload = AuthHelper::requireAuth();

$poolGroupId = isset($_GET['pool_group_id']) ? (int) $_GET['pool_group_id'] : 0;
if ($poolGroupId <= 0) {
    Response::error('pool_group_id obrigatório', 422);
}

$conn = Database::getInstance()->getConnection();
$details = PoolDetailsHelper::getGroupDetails($conn, $poolGroupId, (int) $payload->sub);

if (!$details) {
    Response::error('Grupo pool não encontrado', 404);
}

Response::success(['pool' => $details], 'Detalhes do pool', 200);
