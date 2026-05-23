# Setup local MySQL (XAMPP / MariaDB sem password por defeito)
# Uso: powershell -ExecutionPolicy Bypass -File database/scripts/setup-local.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

Write-Host ">> Aplicar schema..."
mysql -u root -e "source $root/database/schema.sql"

Write-Host ">> Aplicar seed..."
mysql -u root ondjila -e "source $root/database/seed.sql"

Write-Host ">> Validar estrutura..."
mysql -u root ondjila -e "source $root/database/scripts/validate-schema.sql"

Write-Host ">> Concluído. Base de dados 'ondjila' pronta."
