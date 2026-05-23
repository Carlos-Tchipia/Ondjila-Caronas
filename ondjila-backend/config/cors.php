<?php
$origin = $_SERVER['HTTP_ORIGIN'] ?? 'http://localhost:4200';
$allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:4201',
    'http://127.0.0.1:4200',
    'http://127.0.0.1:4201',
];

if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Expose-Headers: Content-Disposition');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
