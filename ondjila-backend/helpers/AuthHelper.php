<?php

require_once __DIR__ . '/Response.php';
require_once __DIR__ . '/../config/jwt.php';

class AuthHelper
{
    public static function requireAuth(): object
    {
        $headers = apache_request_headers();
        if (!isset($headers['Authorization'])) {
            Response::error('Não autorizado', 401);
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);
        $payload = JwtHelper::decodeToken($token);

        if (!$payload) {
            Response::error('Token inválido ou expirado', 401);
        }

        return $payload;
    }

    public static function requireApprovedDriver(PDO $conn, object $payload): int
    {
        $stmt = $conn->prepare(
            "SELECT id FROM drivers WHERE user_id = ? AND approval_status = 'approved'"
        );
        $stmt->execute([$payload->sub]);
        $driverId = $stmt->fetchColumn();

        if (!$driverId) {
            Response::error('Motorista não aprovado', 403);
        }

        return (int) $driverId;
    }

    public static function resolveLoginRole(PDO $conn, array $user): string
    {
        if ($user['role'] === 'admin') {
            return 'admin';
        }

        $stmt = $conn->prepare(
            "SELECT id FROM drivers WHERE user_id = ? AND approval_status = 'approved'"
        );
        $stmt->execute([$user['id']]);

        return $stmt->fetchColumn() ? 'driver' : 'passenger';
    }
}
