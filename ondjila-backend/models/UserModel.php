<?php
require_once __DIR__ . '/../config/database.php';

class UserModel {
    private $conn;

    public function __construct() {
        $this->conn = Database::getInstance()->getConnection();
    }

    public function findByEmail(string $email) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch();
    }
    
    public function updateLastLogin(int $userId) {
        $stmt = $this->conn->prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
    }
}
