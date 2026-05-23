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

$startDate = $_GET['start_date'] ?? date('Y-m-01');
$endDate = $_GET['end_date'] ?? date('Y-m-d');

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
    Response::error('Datas invalidas. Use o formato YYYY-MM-DD.', 422);
}

$conn = Database::getInstance()->getConnection();
Response::success(AdminAnalyticsService::report($conn, $startDate, $endDate), 'Relatorio administrativo gerado');
