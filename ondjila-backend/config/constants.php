<?php
define('FARE_BASE', [
    'economy' => 350,    // AOA base
    'comfort' => 490,
    'xl'      => 650,
]);

define('FARE_PER_KM', [
    'economy' => 180,
    'comfort' => 250,
    'xl'      => 340,
]);

define('FARE_PER_MIN', [
    'economy' => 22,
    'comfort' => 30,
    'xl'      => 42,
]);

define('FARE_MINIMUM', [
    'economy' => 750,
    'comfort' => 950,
    'xl'      => 1250,
]);

define('DYNAMIC_PRICING_MIN_MULTIPLIER', 0.85);
define('DYNAMIC_PRICING_MAX_MULTIPLIER', 2.25);
define('DYNAMIC_PRICING_DEFAULT_CITY', 'Luanda');

define('PLATFORM_COMMISSION', 0.15);  // 15% para a plataforma
define('POOL_DISCOUNT_MIN', 0.30);    // desconto mínimo 30%
define('POOL_DISCOUNT_MAX', 0.50);    // desconto máximo 50%
define('POOL_MATCH_TIMEOUT', 300);    // 5 minutos para encontrar match
define('POOL_ACCEPT_TIMEOUT', 20);    // 20 segundos para motorista aceitar
define('INDIVIDUAL_ACCEPT_TIMEOUT', 15); // 15 segundos para corrida individual
