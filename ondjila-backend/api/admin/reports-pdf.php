<?php
use Mpdf\Mpdf;
use Mpdf\Output\Destination;

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/AuthHelper.php';
require_once '../../helpers/AdminAnalyticsService.php';
require_once '../../vendor/autoload.php';

$payload = AuthHelper::requireAuth();
if (($payload->role ?? null) !== 'admin') {
    Response::error('Acesso restrito ao administrador', 403);
}

$startDate = $_GET['start_date'] ?? date('Y-m-01');
$endDate = $_GET['end_date'] ?? date('Y-m-d');

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
    Response::error('Datas invalidas. Use o formato YYYY-MM-DD.', 422);
}

$conn = Database::getInstance()->getConnection();
$report = AdminAnalyticsService::report($conn, $startDate, $endDate);

function e_pdf(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function metric_value(array $report, string $key): string
{
    foreach ($report['metrics'] as $metric) {
        if (($metric['key'] ?? '') === $key) {
            return (string) ($metric['formatted'] ?? '0 Kz');
        }
    }
    return '0 Kz';
}

$districtRows = '';
foreach ($report['top_districts'] as $district) {
    $districtRows .= '<tr><td>' . e_pdf($district['name']) . '</td><td>' . e_pdf($district['tripsLabel']) . '</td><td>' . e_pdf($district['pct']) . '%</td></tr>';
}
$districtRows = $districtRows ?: '<tr><td colspan="3" class="empty">Sem dados no periodo.</td></tr>';

$activityRows = '';
foreach (array_slice($report['activity'], 0, 12) as $activity) {
    $activityRows .= '<tr><td>' . e_pdf($activity['id']) . '</td><td>' . e_pdf($activity['type']) . '</td><td>' . e_pdf($activity['passenger']) . '</td><td>' . e_pdf($activity['driver']) . '</td><td>' . e_pdf($activity['status']) . '</td><td>' . e_pdf($activity['value']) . '</td></tr>';
}
$activityRows = $activityRows ?: '<tr><td colspan="6" class="empty">Sem actividade no periodo.</td></tr>';

$generatedAt = date('d/m/Y H:i');
$filename = 'ondjila-admin-report-' . $report['range']['start_date'] . '-' . $report['range']['end_date'] . '.pdf';

$html = '
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 11px; }
    .header { background: #047857; color: #ffffff; padding: 22px 24px; border-radius: 10px; }
    .brand { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
    .muted { color: #64748b; }
    .header .muted { color: #d1fae5; }
    .grid { width: 100%; margin: 18px 0; border-spacing: 10px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
    .label { color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: .5px; }
    .value { font-size: 18px; font-weight: 800; margin-top: 6px; color: #047857; }
    h2 { font-size: 15px; margin: 22px 0 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th { background: #f1f5f9; color: #334155; text-align: left; font-size: 10px; padding: 8px; border-bottom: 1px solid #cbd5e1; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    .empty { color: #64748b; text-align: center; }
    .footer { color: #64748b; font-size: 9px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Ondjila Admin</div>
    <div>Relatorio operacional e financeiro</div>
    <div class="muted">Periodo: ' . e_pdf($report['range']['start_date']) . ' a ' . e_pdf($report['range']['end_date']) . ' (' . e_pdf($report['range']['days']) . ' dias)</div>
  </div>

  <table class="grid">
    <tr>
      <td class="card"><div class="label">Receita bruta</div><div class="value">' . e_pdf(metric_value($report, 'gross_revenue')) . '</div></td>
      <td class="card"><div class="label">Comissoes</div><div class="value">' . e_pdf(metric_value($report, 'commissions')) . '</div></td>
      <td class="card"><div class="label">Pagamento a motoristas</div><div class="value">' . e_pdf(metric_value($report, 'driver_payout')) . '</div></td>
    </tr>
    <tr>
      <td class="card"><div class="label">Corridas totais</div><div class="value">' . e_pdf($report['totals']['total_rides']) . '</div></td>
      <td class="card"><div class="label">Corridas concluidas</div><div class="value">' . e_pdf($report['totals']['completed_rides']) . '</div></td>
      <td class="card"><div class="label">Adocao pool</div><div class="value">' . e_pdf($report['totals']['pool_adoption_pct']) . '%</div></td>
    </tr>
  </table>

  <h2>Resumo de mobilidade</h2>
  <table>
    <tr><th>Indicador</th><th>Valor</th></tr>
    <tr><td>Corridas individuais</td><td>' . e_pdf($report['totals']['individual_rides']) . '</td></tr>
    <tr><td>Corridas partilhadas</td><td>' . e_pdf($report['totals']['pool_rides']) . '</td></tr>
    <tr><td>CO2 poupado</td><td>' . e_pdf($report['totals']['co2_saved_ton']) . ' Ton</td></tr>
    <tr><td>Avaliacao media</td><td>' . e_pdf($report['totals']['average_rating']) . '</td></tr>
  </table>

  <h2>Bairros com maior volume</h2>
  <table>
    <tr><th>Bairro/Zona</th><th>Viagens</th><th>Peso relativo</th></tr>
    ' . $districtRows . '
  </table>

  <h2>Actividade recente</h2>
  <table>
    <tr><th>ID</th><th>Tipo</th><th>Passageiro</th><th>Motorista</th><th>Estado</th><th>Valor</th></tr>
    ' . $activityRows . '
  </table>

  <div class="footer">Gerado em ' . e_pdf($generatedAt) . '. Dados extraidos directamente da base de dados Ondjila.</div>
</body>
</html>';

$mpdf = new Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'margin_left' => 10,
    'margin_right' => 10,
    'margin_top' => 10,
    'margin_bottom' => 12,
    'tempDir' => sys_get_temp_dir(),
]);

$mpdf->SetTitle('Ondjila Admin Report');
$mpdf->WriteHTML($html);
$mpdf->Output($filename, Destination::DOWNLOAD);
