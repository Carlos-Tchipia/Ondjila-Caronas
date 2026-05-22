CREATE DATABASE IF NOT EXISTS ondjila
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ondjila;

-- ════════════════════════════════════════════════
-- TABELA 1: UTILIZADORES (passageiros + admins)
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150)    NOT NULL,
  email           VARCHAR(255)    UNIQUE NOT NULL,
  phone           VARCHAR(20)     UNIQUE NOT NULL,
  password_hash   VARCHAR(255)    NOT NULL,
  role            ENUM('passenger','driver','admin') DEFAULT 'passenger',
  avatar_url      VARCHAR(500),
  language        ENUM('pt','en') DEFAULT 'pt',
  theme           ENUM('light','dark','system') DEFAULT 'system',
  wallet_balance  DECIMAL(10,2)   DEFAULT 0.00,
  pool_enabled    BOOLEAN         DEFAULT TRUE,
  pool_preference ENUM('silent','social','no_preference') DEFAULT 'no_preference',
  is_active       BOOLEAN         DEFAULT TRUE,
  otp_code        VARCHAR(6),
  otp_expires_at  TIMESTAMP       NULL,
  last_login_at   TIMESTAMP       NULL,
  created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_role (role)
);

-- ════════════════════════════════════════════════
-- TABELA 2: MOTORISTAS
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS drivers (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNIQUE NOT NULL,
  license_number      VARCHAR(50) UNIQUE NOT NULL,
  vehicle_brand       VARCHAR(80),
  vehicle_model       VARCHAR(80),
  vehicle_year        YEAR,
  vehicle_plate       VARCHAR(20) UNIQUE NOT NULL,
  vehicle_color       VARCHAR(50),
  vehicle_type        ENUM('economy','comfort','xl') DEFAULT 'comfort',
  vehicle_is_electric BOOLEAN DEFAULT FALSE,
  pool_enabled        BOOLEAN DEFAULT FALSE,
  pool_max_passengers TINYINT DEFAULT 2,
  doc_license_front   VARCHAR(500),
  doc_license_back    VARCHAR(500),
  doc_insurance       VARCHAR(500),
  doc_id_card         VARCHAR(500),
  approval_status     ENUM('pending','approved','rejected','suspended') DEFAULT 'pending',
  rejection_reason    TEXT,
  is_available        BOOLEAN DEFAULT FALSE,
  is_accepting_pool   BOOLEAN DEFAULT FALSE,
  current_lat         DECIMAL(10,8),
  current_lng         DECIMAL(11,8),
  total_rides         INT DEFAULT 0,
  total_pool_rides    INT DEFAULT 0,
  average_rating      DECIMAL(3,2) DEFAULT 0.00,
  approved_at         TIMESTAMP NULL,
  approved_by         INT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_available (is_available, approval_status),
  INDEX idx_location (current_lat, current_lng)
);

-- ════════════════════════════════════════════════
-- TABELA 4: GRUPOS DE POOL
-- (Criada antes de 'rides' por causa da Foreign Key)
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS pool_groups (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  driver_id       INT,
  vehicle_type    ENUM('economy','comfort','xl') NOT NULL,
  status          ENUM('forming','active','in_progress','completed','cancelled') DEFAULT 'forming',
  max_passengers  TINYINT DEFAULT 2,
  current_count   TINYINT DEFAULT 0,
  origin_zone     VARCHAR(100),      -- zona/bairro de origem (para matching)
  destination_zone VARCHAR(100),     -- zona/bairro de destino (para matching)
  route_data      JSON,              -- rota combinada com todas as paragens (OSRM)
  started_at      TIMESTAMP NULL,
  completed_at    TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  INDEX idx_status (status),
  INDEX idx_zones (origin_zone, destination_zone)
);

-- ════════════════════════════════════════════════
-- TABELA 3: CORRIDAS / VIAGENS
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rides (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  passenger_id         INT NOT NULL,
  driver_id            INT,
  pool_group_id        INT,          -- FK para pool_groups (NULL se individual)
  ride_type            ENUM('individual','pool') DEFAULT 'individual',
  origin_address       VARCHAR(500) NOT NULL,
  origin_lat           DECIMAL(10,8) NOT NULL,
  origin_lng           DECIMAL(11,8) NOT NULL,
  destination_address  VARCHAR(500) NOT NULL,
  destination_lat      DECIMAL(10,8) NOT NULL,
  destination_lng      DECIMAL(11,8) NOT NULL,
  vehicle_type         ENUM('economy','comfort','xl') NOT NULL,
  status               ENUM('pending','accepted','in_progress','completed','cancelled') DEFAULT 'pending',
  pool_status          ENUM('waiting_match','matched','boarding','in_progress','delivered') NULL,
  scheduled_at         TIMESTAMP NULL,
  accepted_at          TIMESTAMP NULL,
  started_at           TIMESTAMP NULL,
  completed_at         TIMESTAMP NULL,
  cancelled_at         TIMESTAMP NULL,
  cancellation_reason  VARCHAR(255),
  pickup_order         TINYINT DEFAULT 1,   -- ordem de recolha no pool
  delivery_order       TINYINT DEFAULT 1,   -- ordem de entrega no pool
  distance_km          DECIMAL(8,2),
  duration_minutes     INT,
  fare_estimate        DECIMAL(10,2),
  fare_final           DECIMAL(10,2),
  fare_original        DECIMAL(10,2),       -- preço se fosse individual (para mostrar desconto pool)
  pool_discount_pct    DECIMAL(5,2) DEFAULT 0,
  payment_method       ENUM('cash','wallet','multicaixa') DEFAULT 'cash',
  promo_code           VARCHAR(20),
  promo_discount       DECIMAL(10,2) DEFAULT 0,
  is_paid              BOOLEAN DEFAULT FALSE,
  sharing_token        VARCHAR(100) UNIQUE,  -- para partilha pública de rota
  passenger_rating     TINYINT,
  passenger_review     TEXT,
  driver_rating        TINYINT,
  driver_review        TEXT,
  co2_saved_kg         DECIMAL(6,3) DEFAULT 0,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (passenger_id) REFERENCES users(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (pool_group_id) REFERENCES pool_groups(id) ON DELETE SET NULL,
  INDEX idx_passenger (passenger_id),
  INDEX idx_driver (driver_id),
  INDEX idx_status (status),
  INDEX idx_pool_group (pool_group_id),
  INDEX idx_sharing_token (sharing_token)
);

-- ════════════════════════════════════════════════
-- TABELA 5: AVALIAÇÕES DE CO-PASSAGEIROS (Pool)
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS co_passenger_ratings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pool_group_id   INT NOT NULL,
  rater_id        INT NOT NULL,       -- quem avaliou
  rated_id        INT NOT NULL,       -- quem foi avaliado
  rating          TINYINT NOT NULL,
  tags            JSON,               -- ["Simpático","Silencioso","Pontual"]
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pool_group_id) REFERENCES pool_groups(id),
  FOREIGN KEY (rater_id) REFERENCES users(id),
  FOREIGN KEY (rated_id) REFERENCES users(id),
  UNIQUE KEY unique_rating (pool_group_id, rater_id, rated_id)
);

-- ════════════════════════════════════════════════
-- TABELA 6: TRANSAÇÕES FINANCEIRAS
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS transactions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  ride_id         INT,
  type            ENUM('ride_payment','top_up','withdrawal','refund','commission','pool_share') NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  balance_after   DECIMAL(10,2) NOT NULL,
  description     VARCHAR(255),
  status          ENUM('pending','completed','failed') DEFAULT 'completed',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_type (type)
);

-- ════════════════════════════════════════════════
-- TABELA 7: NOTIFICAÇÕES
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  title           VARCHAR(150) NOT NULL,
  body            TEXT NOT NULL,
  type            ENUM('ride_request','ride_accepted','ride_started','ride_completed',
                       'payment','system','promo','pool_match','pool_cancelled',
                       'pool_passenger_aboard','pool_delivered') NOT NULL,
  data            JSON,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read)
);

-- ════════════════════════════════════════════════
-- TABELA 8: SESSÕES / REFRESH TOKENS
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token       VARCHAR(500) NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(100))
);

-- ════════════════════════════════════════════════
-- TABELA 9: MENSAGENS DE CHAT
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  ride_id     INT NOT NULL,
  sender_id   INT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  INDEX idx_ride (ride_id)
);

-- ════════════════════════════════════════════════
-- TABELA 10: LOCAIS FAVORITOS
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS favorites (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(50) DEFAULT 'star',
  address     VARCHAR(500) NOT NULL,
  lat         DECIMAL(10,8) NOT NULL,
  lng         DECIMAL(11,8) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ════════════════════════════════════════════════
-- TABELA 11: PROMOÇÕES
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS promotions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(20) UNIQUE NOT NULL,
  discount_type   ENUM('percentage','fixed') NOT NULL,
  discount_value  DECIMAL(8,2) NOT NULL,
  max_discount    DECIMAL(8,2),
  min_fare        DECIMAL(8,2) DEFAULT 0,
  applicable_to   ENUM('individual','pool','both') DEFAULT 'both',
  max_uses        INT,
  used_count      INT DEFAULT 0,
  target_users    ENUM('all','new','returning') DEFAULT 'all',
  expires_at      TIMESTAMP NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
);

-- ════════════════════════════════════════════════
-- TABELA 12: DENÚNCIAS
-- ════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS reports (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id     INT NOT NULL,
  ride_id         INT,
  reported_user_id INT,
  type            ENUM('behaviour','accident','lost_item','overcharge','pool_issue','other') NOT NULL,
  description     TEXT NOT NULL,
  evidence_url    VARCHAR(500),
  status          ENUM('open','investigating','resolved','dismissed') DEFAULT 'open',
  admin_notes     TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at     TIMESTAMP NULL,
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL,
  FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL
);
