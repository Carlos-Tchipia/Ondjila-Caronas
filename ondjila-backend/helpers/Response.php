<?php
class Response {
    public static function success($data = null, string $message = 'OK', int $code = 200): void {
        http_response_code($code);
        echo json_encode(['success' => true, 'data' => $data, 'message' => $message]);
        exit;
    }
    
    public static function error(string $message, int $code = 400, $errors = null): void {
        http_response_code($code);
        echo json_encode(['success' => false, 'data' => null, 'message' => $message, 'errors' => $errors]);
        exit;
    }
}
