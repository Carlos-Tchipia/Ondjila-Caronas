USE ondjila;

CREATE TABLE IF NOT EXISTS pricing_controls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  control_key VARCHAR(80) UNIQUE NOT NULL,
  control_value JSON NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  updated_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing_quotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id INT NULL,
  ride_id INT NULL,
  ride_type ENUM('individual','pool') DEFAULT 'individual',
  vehicle_type ENUM('economy','comfort','xl') NOT NULL,
  origin_lat DECIMAL(10,8) NOT NULL,
  origin_lng DECIMAL(11,8) NOT NULL,
  destination_lat DECIMAL(10,8) NOT NULL,
  destination_lng DECIMAL(11,8) NOT NULL,
  region VARCHAR(100),
  distance_km DECIMAL(8,2) NOT NULL,
  duration_minutes INT NOT NULL,
  base_fare DECIMAL(10,2) NOT NULL,
  final_fare DECIMAL(10,2) NOT NULL,
  surge_multiplier DECIMAL(5,2) NOT NULL,
  multipliers JSON,
  factors JSON,
  reasons JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_quote_created (created_at),
  INDEX idx_quote_region (region),
  INDEX idx_quote_passenger (passenger_id)
);

CREATE TABLE IF NOT EXISTS dynamic_pricing_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quote_id INT NULL,
  level ENUM('debug','info','warning','error') DEFAULT 'info',
  message VARCHAR(255) NOT NULL,
  context JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pricing_logs_created (created_at),
  INDEX idx_pricing_logs_quote (quote_id)
);

ALTER TABLE rides ADD COLUMN IF NOT EXISTS pricing_quote_id INT NULL;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS surge_multiplier DECIMAL(5,2) DEFAULT 1.00;
ALTER TABLE rides ADD COLUMN IF NOT EXISTS fare_breakdown JSON NULL;
