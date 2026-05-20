<?php
require_once 'config/database.php';
$conn = Database::getInstance()->getConnection();
$conn->exec("UPDATE users SET wallet_balance = 10000.00");
echo "Balances updated to 10000.00 Kz\n";
