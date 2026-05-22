-- Migração: corrige ENUM de pool_groups e adiciona role 'driver' aos utilizadores
-- Executar em bases de dados já criadas: mysql -u root -p ondjila < database/migrations/001_fix_pool_status_and_driver_role.sql

USE ondjila;

ALTER TABLE users
  MODIFY COLUMN role ENUM('passenger','driver','admin') DEFAULT 'passenger';

ALTER TABLE pool_groups
  MODIFY COLUMN status ENUM('forming','active','in_progress','completed','cancelled') DEFAULT 'forming';

UPDATE users SET role = 'driver' WHERE id IN (5, 6);
