-- Validação rápida da estrutura Ondjila (executar: mysql -u root ondjila < database/scripts/validate-schema.sql)

USE ondjila;

SELECT 'pool_groups.status' AS check_item,
       COLUMN_TYPE AS result
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'ondjila' AND TABLE_NAME = 'pool_groups' AND COLUMN_NAME = 'status';

SELECT 'users.role' AS check_item,
       COLUMN_TYPE AS result
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'ondjila' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role';

SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ondjila' AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
