<?php
require_once __DIR__ . '/../vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class JwtHelper {
    private static $secret = null;
    private static $algo = 'HS256';

    private static function getSecret(): string {
        if (!self::$secret) {
            self::$secret = getenv('JWT_SECRET') ?: 'your_super_secret_key_min_32_chars';
        }
        return self::$secret;
    }

    public static function generateToken(array $payload, int $expirySeconds = 3600): string {
        $issuedAt = time();
        $expire = $issuedAt + $expirySeconds;

        $tokenPayload = array_merge([
            'iat' => $issuedAt,
            'exp' => $expire
        ], $payload);

        return JWT::encode($tokenPayload, self::getSecret(), self::$algo);
    }

    public static function decodeToken(string $token) {
        try {
            return JWT::decode($token, new Key(self::getSecret(), self::$algo));
        } catch (Exception $e) {
            return null;
        }
    }
}
