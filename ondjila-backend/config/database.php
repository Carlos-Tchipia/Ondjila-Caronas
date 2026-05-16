<?php
class Database {
    private static $instance = null;
    private $connection;

    private $host = 'localhost';
    private $db   = 'ondjila';
    private $user = 'root';
    private $pass = ''; // Altere se tiver senha configurada
    private $charset = 'utf8mb4';

    private function __construct() {
        // Opções de PDO
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $dsn = "mysql:host={$this->host};dbname={$this->db};charset={$this->charset}";
        try {
            $this->connection = new PDO($dsn, $this->user, $this->pass, $options);
        } catch (\PDOException $e) {
            // Tratamento de erro seguro em produção (não expor a senha)
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
    }

    public static function getInstance() {
        if (self::$instance == null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}
