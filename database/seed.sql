USE ondjila;

-- ════════════════════════════════════════════════
-- DADOS DE SEED (TESTE)
-- ════════════════════════════════════════════════

-- Admin
INSERT IGNORE INTO users (id, name, email, phone, password_hash, role) VALUES
(1, 'Admin Ondjila', 'admin@Ondjila.ao', '+244923000001', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'); -- Senha: password

-- Passageiros (3)
INSERT IGNORE INTO users (id, name, email, phone, password_hash, role, wallet_balance) VALUES
(2, 'Ana Ferreira', 'ana@email.com', '+244923000002', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'passenger', 5000.00), -- Senha: password
(3, 'Carlos Mendes', 'carlos@email.com', '+244923000003', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'passenger', 2500.00), -- Senha: password
(4, 'Sofia Neto', 'sofia@email.com', '+244923000004', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'passenger', 8000.00); -- Senha: password

-- Utilizadores que serão motoristas
INSERT IGNORE INTO users (id, name, email, phone, password_hash, role) VALUES
(5, 'João Motorista', 'joao.motorista@email.com', '+244923000005', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'driver'), -- Senha: password
(6, 'Miguel Santos', 'miguel.santos@email.com', '+244923000006', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'driver'), -- Senha: password
(7, 'Paulo Pendente', 'paulo.pendente@email.com', '+244923000007', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'passenger'); -- Senha: password

-- Motoristas (2 aprovados, 1 pendente)
INSERT IGNORE INTO drivers (id, user_id, license_number, vehicle_brand, vehicle_model, vehicle_year, vehicle_plate, vehicle_color, vehicle_type, pool_enabled, pool_max_passengers, approval_status, is_available, is_accepting_pool) VALUES
(1, 5, 'LIC-1001', 'Mercedes-Benz', 'Classe E', 2019, 'LD-00-11-AA', 'Prata', 'comfort', TRUE, 3, 'approved', TRUE, TRUE),
(2, 6, 'LIC-1002', 'Toyota', 'Corolla', 2021, 'LD-00-22-BB', 'Branco', 'economy', TRUE, 4, 'approved', TRUE, FALSE),
(3, 7, 'LIC-1003', 'Hyundai', 'Tucson', 2018, 'LD-00-33-CC', 'Preto', 'xl', FALSE, 4, 'pending', FALSE, FALSE);
