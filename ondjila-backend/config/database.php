<?php
class Database {
    private static $instance = null;
    private $connection;

    private $host;
    private $db;
    private $user;
    private $pass;
    private $charset = 'utf8mb4';

    private function __construct() {
        $this->loadEnvConfig();
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

    private function loadEnvConfig(): void
    {
        $envPath = __DIR__ . '/../.env';
        $env = [];

        if (is_file($envPath)) {
            foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
                    continue;
                }
                [$key, $value] = array_map('trim', explode('=', $line, 2));
                $env[$key] = trim($value, "\"'");
            }
        }

        $this->host = $env['DB_HOST'] ?? 'localhost';
        $this->db = $env['DB_NAME'] ?? 'ondjila';
        $this->user = $env['DB_USER'] ?? 'root';
        $this->pass = $env['DB_PASS'] ?? '';
    }
}
