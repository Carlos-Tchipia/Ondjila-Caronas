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

$section = $_GET['section'] ?? '';
if (!in_array($section, ['users', 'rides', 'payments'], true)) {
    Response::error('Seccao administrativa invalida', 422);
}

$conn = Database::getInstance()->getConnection();
Response::success(AdminAnalyticsService::section($conn, $section), 'Seccao administrativa carregada');
