<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/DynamicPricingService.php';
require_once '../../helpers/PricingControlService.php';

$payload = AuthHelper::requireAuth();
if (($payload->role ?? null) !== 'admin') {
    Response::error('Acesso restrito ao administrador', 403);
}

$conn = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?: [];
    PricingSchemaHelper::ensure($conn);
    $controls = PricingControlService::save($conn, $data, (int) $payload->sub);
    Response::success(['controls' => $controls], 'Controles de precificacao atualizados');
}

$controls = PricingControlService::get($conn);
$metrics = DynamicPricingService::metrics($conn);

Response::success([
    'controls' => $controls,
    'metrics' => $metrics,
], 'Painel de precificacao carregado');
