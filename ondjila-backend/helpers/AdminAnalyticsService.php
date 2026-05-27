<?php
require_once __DIR__ . '/../config/constants.php';

class AdminAnalyticsService
{
    public static function overview(PDO $conn): array
    {
        $todayStart = date('Y-m-d 00:00:00');
        $todayEnd = date('Y-m-d 23:59:59');
        $yesterdayStart = date('Y-m-d 00:00:00', strtotime('-1 day'));
        $yesterdayEnd = date('Y-m-d 23:59:59', strtotime('-1 day'));

        $tripsToday = self::countRides($conn, $todayStart, $todayEnd);
        $tripsYesterday = self::countRides($conn, $yesterdayStart, $yesterdayEnd);
        $revenueToday = self::sumRevenue($conn, $todayStart, $todayEnd);
        $revenueYesterday = self::sumRevenue($conn, $yesterdayStart, $yesterdayEnd);
        $driversOnline = self::scalar($conn, "SELECT COUNT(*) FROM drivers WHERE approval_status = 'approved' AND is_available = 1");
        $driversOnlineYesterday = self::scalar($conn, "
            SELECT COUNT(DISTINCT driver_id)
            FROM rides
            WHERE driver_id IS NOT NULL
              AND created_at BETWEEN ? AND ?
        ", [$yesterdayStart, $yesterdayEnd]);
        $newUsersToday = self::scalar($conn, "SELECT COUNT(*) FROM users WHERE created_at BETWEEN ? AND ?", [$todayStart, $todayEnd]);
        $newUsersYesterday = self::scalar($conn, "SELECT COUNT(*) FROM users WHERE created_at BETWEEN ? AND ?", [$yesterdayStart, $yesterdayEnd]);

        return [
            'kpis' => [
                [
                    'key' => 'trips_today',
                    'labelKey' => 'admin.tripsToday',
                    'value' => (int) $tripsToday,
                    'formatted' => number_format((int) $tripsToday, 0, ',', '.'),
                    'trend' => self::trend($tripsToday, $tripsYesterday),
                    'color' => 'green',
                ],
                [
                    'key' => 'revenue_today',
                    'labelKey' => 'admin.revenueToday',
                    'value' => round($revenueToday, 2),
                    'formatted' => self::formatAoa($revenueToday),
                    'trend' => self::trend($revenueToday, $revenueYesterday),
                    'color' => 'blue',
                ],
                [
                    'key' => 'drivers_online',
                    'labelKey' => 'admin.driversOnline',
                    'value' => (int) $driversOnline,
                    'formatted' => number_format((int) $driversOnline, 0, ',', '.'),
                    'trend' => self::trend($driversOnline, $driversOnlineYesterday),
                    'color' => 'green',
                ],
                [
                    'key' => 'new_users',
                    'labelKey' => 'admin.newUsers',
                    'value' => (int) $newUsersToday,
                    'formatted' => number_format((int) $newUsersToday, 0, ',', '.'),
                    'trend' => self::trend($newUsersToday, $newUsersYesterday),
                    'color' => 'pink',
                ],
            ],
            'fleet' => self::fleetSeries($conn, 24),
            'zones' => self::topZones($conn, $todayStart, $todayEnd, 6),
            'rankings' => self::operationalRankings($conn),
            'activity' => self::recentActivity($conn, 8),
        ];
    }

    public static function report(PDO $conn, string $startDate, string $endDate): array
    {
        [$start, $end] = self::normalizeRange($startDate, $endDate);
        $totalRides = self::countRides($conn, $start, $end, false);
        $completedRides = self::countRides($conn, $start, $end, true);
        $poolRides = self::scalar($conn, "SELECT COUNT(*) FROM rides WHERE ride_type = 'pool' AND created_at BETWEEN ? AND ?", [$start, $end]);
        $grossRevenue = self::sumRevenue($conn, $start, $end);
        $commissions = round($grossRevenue * PLATFORM_COMMISSION, 2);
        $driverPayout = round($grossRevenue - $commissions, 2);
        $co2Kg = (float) self::scalar($conn, "SELECT COALESCE(SUM(co2_saved_kg), 0) FROM rides WHERE created_at BETWEEN ? AND ?", [$start, $end]);
        $avgRating = self::averageRating($conn, $start, $end);

        return [
            'range' => [
                'start_date' => substr($start, 0, 10),
                'end_date' => substr($end, 0, 10),
                'days' => max(1, (int) floor((strtotime($end) - strtotime($start)) / 86400) + 1),
            ],
            'metrics' => [
                ['key' => 'gross_revenue', 'labelKey' => 'admin.grossRevenue', 'value' => $grossRevenue, 'formatted' => self::formatAoa($grossRevenue), 'trend' => 'real'],
                ['key' => 'commissions', 'labelKey' => 'admin.commissions', 'value' => $commissions, 'formatted' => self::formatAoa($commissions), 'trend' => round(PLATFORM_COMMISSION * 100) . '%'],
                ['key' => 'driver_payout', 'labelKey' => 'admin.driverPayout', 'value' => $driverPayout, 'formatted' => self::formatAoa($driverPayout), 'trend' => 'liquido', 'highlight' => true],
            ],
            'totals' => [
                'total_rides' => (int) $totalRides,
                'completed_rides' => (int) $completedRides,
                'pool_rides' => (int) $poolRides,
                'individual_rides' => max(0, (int) $totalRides - (int) $poolRides),
                'pool_adoption_pct' => $totalRides > 0 ? round(($poolRides / $totalRides) * 100, 1) : 0,
                'co2_saved_ton' => round($co2Kg / 1000, 3),
                'average_rating' => $avgRating,
            ],
            'top_districts' => self::topZones($conn, $start, $end, 8),
            'adoption' => self::adoptionByWeekday($conn, $start, $end),
            'activity' => self::activityInRange($conn, $start, $end, 25),
        ];
    }

    public static function drivers(PDO $conn): array
    {
        $rows = $conn->query("
            SELECT d.id, d.approval_status, d.is_available, d.vehicle_plate, d.vehicle_brand,
                   d.vehicle_model, d.vehicle_year, d.vehicle_type, d.created_at,
                   d.doc_license_front, d.doc_license_back, d.doc_insurance, d.doc_id_card,
                   u.name, u.email
            FROM drivers d
            INNER JOIN users u ON u.id = d.user_id
            ORDER BY d.created_at DESC
            LIMIT 200
        ")->fetchAll(PDO::FETCH_ASSOC);

        $summary = [
            'pending' => (int) self::scalar($conn, "SELECT COUNT(*) FROM drivers WHERE approval_status = 'pending'"),
            'approved' => (int) self::scalar($conn, "SELECT COUNT(*) FROM drivers WHERE approval_status = 'approved'"),
            'rejected' => (int) self::scalar($conn, "SELECT COUNT(*) FROM drivers WHERE approval_status = 'rejected'"),
            'suspended' => (int) self::scalar($conn, "SELECT COUNT(*) FROM drivers WHERE approval_status = 'suspended'"),
            'online' => (int) self::scalar($conn, "SELECT COUNT(*) FROM drivers WHERE approval_status = 'approved' AND is_available = 1"),
            'total' => (int) self::scalar($conn, 'SELECT COUNT(*) FROM drivers'),
        ];

        $drivers = array_map(static function ($row) {
            $status = $row['approval_status'] ?? 'pending';
            $docs = array_filter([
                $row['doc_license_front'] ?? null,
                $row['doc_license_back'] ?? null,
                $row['doc_insurance'] ?? null,
                $row['doc_id_card'] ?? null,
            ]);
            $name = $row['name'] ?: 'Motorista';
            return [
                'id' => (int) $row['id'],
                'display_id' => '#' . str_pad((string) $row['id'], 5, '0', STR_PAD_LEFT),
                'name' => $name,
                'initials' => self::initials($name),
                'email' => $row['email'],
                'approval_status' => $status,
                'is_available' => (bool) $row['is_available'],
                'plate' => $row['vehicle_plate'] ?: '-',
                'vehicle' => trim(($row['vehicle_brand'] ?? '') . ' ' . ($row['vehicle_model'] ?? '') . ' ' . ($row['vehicle_year'] ?? '')) ?: $row['vehicle_type'],
                'vehicle_type' => $row['vehicle_type'],
                'date' => date('d/m/Y', strtotime($row['created_at'])),
                'docs' => count($docs),
                'docsTotal' => 4,
            ];
        }, $rows);

        return ['summary' => $summary, 'drivers' => $drivers];
    }

    public static function section(PDO $conn, string $section): array
    {
        return match ($section) {
            'users' => self::usersSection($conn),
            'rides' => self::ridesSection($conn),
            'payments' => self::paymentsSection($conn),
            default => ['metrics' => [], 'rows' => []],
        };
    }

    private static function usersSection(PDO $conn): array
    {
        $todayStart = date('Y-m-d 00:00:00');
        $todayEnd = date('Y-m-d 23:59:59');
        $rows = $conn->query("
            SELECT name, role, is_active, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 20
        ")->fetchAll(PDO::FETCH_ASSOC);

        return [
            'metrics' => [
                ['labelKey' => 'admin.totalUsers', 'value' => number_format((int) self::scalar($conn, 'SELECT COUNT(*) FROM users'), 0, ',', '.'), 'trend' => 'real', 'good' => true],
                ['labelKey' => 'admin.newUsers', 'value' => number_format((int) self::scalar($conn, 'SELECT COUNT(*) FROM users WHERE created_at BETWEEN ? AND ?', [$todayStart, $todayEnd]), 0, ',', '.'), 'trend' => 'hoje'],
                ['labelKey' => 'admin.activeUsers', 'value' => number_format((int) self::scalar($conn, 'SELECT COUNT(*) FROM users WHERE is_active = 1'), 0, ',', '.'), 'trend' => 'ativos', 'good' => true],
            ],
            'rows' => array_map(static fn($row) => [
                'name' => $row['name'],
                'status' => (int) $row['is_active'] === 1 ? 'Activo' : 'Inactivo',
                'value' => $row['role'] . ' - ' . date('d/m/Y', strtotime($row['created_at'])),
            ], $rows),
        ];
    }

    private static function ridesSection(PDO $conn): array
    {
        $todayStart = date('Y-m-d 00:00:00');
        $todayEnd = date('Y-m-d 23:59:59');
        $totalToday = self::countRides($conn, $todayStart, $todayEnd);
        $poolToday = (int) self::scalar($conn, "SELECT COUNT(*) FROM rides WHERE ride_type = 'pool' AND created_at BETWEEN ? AND ?", [$todayStart, $todayEnd]);
        $rows = $conn->query("
            SELECT id, origin_address, destination_address, status, fare_final
            FROM rides
            ORDER BY created_at DESC
            LIMIT 20
        ")->fetchAll(PDO::FETCH_ASSOC);

        return [
            'metrics' => [
                ['labelKey' => 'admin.tripsToday', 'value' => number_format($totalToday, 0, ',', '.'), 'trend' => 'hoje', 'good' => true],
                ['labelKey' => 'admin.poolAnalysis', 'value' => ($totalToday > 0 ? round(($poolToday / $totalToday) * 100) : 0) . '%', 'trend' => 'pool'],
                ['labelKey' => 'admin.revenueToday', 'value' => self::formatAoa(self::sumRevenue($conn, $todayStart, $todayEnd)), 'trend' => 'real', 'good' => true],
            ],
            'rows' => array_map(static fn($row) => [
                'name' => '#' . str_pad((string) $row['id'], 5, '0', STR_PAD_LEFT) . ' - ' . $row['origin_address'],
                'status' => $row['status'],
                'value' => self::formatAoa((float) ($row['fare_final'] ?? 0)),
            ], $rows),
        ];
    }

    private static function paymentsSection(PDO $conn): array
    {
        $monthStart = date('Y-m-01 00:00:00');
        $todayEnd = date('Y-m-d 23:59:59');
        $grossRevenue = self::sumRevenue($conn, $monthStart, $todayEnd);
        $rows = $conn->query("
            SELECT type, amount, status, description, created_at
            FROM transactions
            ORDER BY created_at DESC
            LIMIT 20
        ")->fetchAll(PDO::FETCH_ASSOC);

        return [
            'metrics' => [
                ['labelKey' => 'admin.grossRevenue', 'value' => self::formatAoa($grossRevenue), 'trend' => 'mes', 'good' => true],
                ['labelKey' => 'admin.commissions', 'value' => self::formatAoa($grossRevenue * PLATFORM_COMMISSION), 'trend' => round(PLATFORM_COMMISSION * 100) . '%'],
                ['labelKey' => 'admin.transactions', 'value' => number_format((int) self::scalar($conn, 'SELECT COUNT(*) FROM transactions'), 0, ',', '.'), 'trend' => 'real', 'good' => true],
            ],
            'rows' => array_map(static fn($row) => [
                'name' => $row['description'] ?: $row['type'],
                'status' => $row['status'],
                'value' => self::formatAoa((float) $row['amount']),
            ], $rows),
        ];
    }

    private static function normalizeRange(string $startDate, string $endDate): array
    {
        $start = DateTime::createFromFormat('Y-m-d', $startDate) ?: new DateTime('first day of this month');
        $end = DateTime::createFromFormat('Y-m-d', $endDate) ?: new DateTime('today');
        if ($start > $end) {
            [$start, $end] = [$end, $start];
        }
        return [$start->format('Y-m-d 00:00:00'), $end->format('Y-m-d 23:59:59')];
    }

    private static function operationalRankings(PDO $conn): array
    {
        $todayStart = date('Y-m-d 00:00:00');
        $todayEnd = date('Y-m-d 23:59:59');
        $monthStart = date('Y-m-01 00:00:00');
        $totalMonth = self::countRides($conn, $monthStart, $todayEnd, false);
        $completedMonth = self::countRides($conn, $monthStart, $todayEnd, true);
        $cancelledMonth = (int) self::scalar($conn, "
            SELECT COUNT(*)
            FROM rides
            WHERE status = 'cancelled'
              AND created_at BETWEEN ? AND ?
        ", [$monthStart, $todayEnd]);
        $poolMonth = (int) self::scalar($conn, "
            SELECT COUNT(*)
            FROM rides
            WHERE ride_type = 'pool'
              AND created_at BETWEEN ? AND ?
        ", [$monthStart, $todayEnd]);
        $grossMonth = self::sumRevenue($conn, $monthStart, $todayEnd);

        return [
            'top_passengers' => self::topPassengers($conn, $monthStart, $todayEnd, 5),
            'top_drivers' => self::topDrivers($conn, $monthStart, $todayEnd, 5),
            'driver_earnings' => self::driverEarnings($conn, $todayStart, $todayEnd, $monthStart, 5),
            'business_health' => [
                [
                    'label' => 'Ticket medio mensal',
                    'value' => $completedMonth > 0 ? self::formatAoa($grossMonth / $completedMonth) : self::formatAoa(0),
                    'meta' => 'corridas pagas',
                ],
                [
                    'label' => 'Taxa de cancelamento',
                    'value' => $totalMonth > 0 ? round(($cancelledMonth / $totalMonth) * 100, 1) . '%' : '0%',
                    'meta' => 'este mes',
                ],
                [
                    'label' => 'Adocao pool',
                    'value' => $totalMonth > 0 ? round(($poolMonth / $totalMonth) * 100, 1) . '%' : '0%',
                    'meta' => 'este mes',
                ],
            ],
        ];
    }

    private static function topPassengers(PDO $conn, string $start, string $end, int $limit): array
    {
        $stmt = $conn->prepare("
            SELECT u.id, u.name, COUNT(r.id) AS trips, COALESCE(SUM(r.fare_final), 0) AS spend
            FROM users u
            INNER JOIN rides r ON r.passenger_id = u.id
            WHERE r.status = 'completed'
              AND r.created_at BETWEEN ? AND ?
            GROUP BY u.id, u.name
            ORDER BY trips DESC, spend DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $start);
        $stmt->bindValue(2, $end);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();

        return array_map(static fn($row) => [
            'id' => (int) $row['id'],
            'name' => $row['name'] ?: 'Passageiro',
            'total' => (int) $row['trips'],
            'formatted' => number_format((int) $row['trips'], 0, ',', '.') . ' viagens',
            'meta' => self::formatAoa((float) $row['spend']) . ' pagos',
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private static function topDrivers(PDO $conn, string $start, string $end, int $limit): array
    {
        $stmt = $conn->prepare("
            SELECT d.id, u.name, COUNT(r.id) AS trips, COALESCE(SUM(r.fare_final), 0) AS revenue
            FROM drivers d
            INNER JOIN users u ON u.id = d.user_id
            LEFT JOIN rides r ON r.driver_id = d.id
                AND r.status = 'completed'
                AND r.created_at BETWEEN ? AND ?
            GROUP BY d.id, u.name
            HAVING trips > 0
            ORDER BY trips DESC, revenue DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $start);
        $stmt->bindValue(2, $end);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();

        return array_map(static fn($row) => [
            'id' => (int) $row['id'],
            'name' => $row['name'] ?: 'Motorista',
            'total' => (int) $row['trips'],
            'formatted' => number_format((int) $row['trips'], 0, ',', '.') . ' viagens',
            'meta' => self::formatAoa((float) $row['revenue']) . ' faturados',
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private static function driverEarnings(PDO $conn, string $todayStart, string $todayEnd, string $monthStart, int $limit): array
    {
        $stmt = $conn->prepare("
            SELECT d.id, u.name,
                   COALESCE(SUM(CASE
                       WHEN r.status = 'completed' AND r.is_paid = 1 AND r.created_at BETWEEN ? AND ?
                       THEN r.fare_final ELSE 0 END), 0) AS today_gross,
                   COALESCE(SUM(CASE
                       WHEN r.status = 'completed' AND r.is_paid = 1 AND r.created_at BETWEEN ? AND ?
                       THEN r.fare_final ELSE 0 END), 0) AS month_gross,
                   COALESCE(SUM(CASE
                       WHEN r.status = 'completed' AND r.created_at BETWEEN ? AND ?
                       THEN 1 ELSE 0 END), 0) AS rides_today,
                   COALESCE(SUM(CASE
                       WHEN r.status = 'completed' AND r.created_at BETWEEN ? AND ?
                       THEN 1 ELSE 0 END), 0) AS rides_month
            FROM drivers d
            INNER JOIN users u ON u.id = d.user_id
            LEFT JOIN rides r ON r.driver_id = d.id
            GROUP BY d.id, u.name
            HAVING month_gross > 0 OR rides_month > 0
            ORDER BY month_gross DESC, rides_month DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $todayStart);
        $stmt->bindValue(2, $todayEnd);
        $stmt->bindValue(3, $monthStart);
        $stmt->bindValue(4, $todayEnd);
        $stmt->bindValue(5, $todayStart);
        $stmt->bindValue(6, $todayEnd);
        $stmt->bindValue(7, $monthStart);
        $stmt->bindValue(8, $todayEnd);
        $stmt->bindValue(9, $limit, PDO::PARAM_INT);
        $stmt->execute();

        return array_map(static function ($row) {
            $todayNet = (float) $row['today_gross'] * (1 - PLATFORM_COMMISSION);
            $monthNet = (float) $row['month_gross'] * (1 - PLATFORM_COMMISSION);
            return [
                'driver_id' => (int) $row['id'],
                'name' => $row['name'] ?: 'Motorista',
                'today' => round($todayNet, 2),
                'month' => round($monthNet, 2),
                'rides_today' => (int) $row['rides_today'],
                'rides_month' => (int) $row['rides_month'],
                'today_formatted' => self::formatAoa($todayNet),
                'month_formatted' => self::formatAoa($monthNet),
            ];
        }, $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private static function countRides(PDO $conn, string $start, string $end, bool $completedOnly = false): int
    {
        $sql = "SELECT COUNT(*) FROM rides WHERE created_at BETWEEN ? AND ?";
        $params = [$start, $end];
        if ($completedOnly) {
            $sql .= " AND status = 'completed'";
        }
        return (int) self::scalar($conn, $sql, $params);
    }

    private static function sumRevenue(PDO $conn, string $start, string $end): float
    {
        return (float) self::scalar($conn, "
            SELECT COALESCE(SUM(fare_final), 0)
            FROM rides
            WHERE status = 'completed'
              AND is_paid = 1
              AND created_at BETWEEN ? AND ?
        ", [$start, $end]);
    }

    private static function recentActivity(PDO $conn, int $limit): array
    {
        $stmt = $conn->prepare("
            SELECT r.id, r.ride_type, r.status, r.fare_final,
                   p.name AS passenger_name, du.name AS driver_name
            FROM rides r
            INNER JOIN users p ON p.id = r.passenger_id
            LEFT JOIN drivers d ON d.id = r.driver_id
            LEFT JOIN users du ON du.id = d.user_id
            ORDER BY r.created_at DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return array_map([self::class, 'activityRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private static function activityInRange(PDO $conn, string $start, string $end, int $limit): array
    {
        $stmt = $conn->prepare("
            SELECT r.id, r.ride_type, r.status, r.fare_final,
                   p.name AS passenger_name, du.name AS driver_name
            FROM rides r
            INNER JOIN users p ON p.id = r.passenger_id
            LEFT JOIN drivers d ON d.id = r.driver_id
            LEFT JOIN users du ON du.id = d.user_id
            WHERE r.created_at BETWEEN ? AND ?
            ORDER BY r.created_at DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $start);
        $stmt->bindValue(2, $end);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();
        return array_map([self::class, 'activityRow'], $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private static function activityRow(array $row): array
    {
        return [
            'id' => '#' . str_pad((string) $row['id'], 5, '0', STR_PAD_LEFT),
            'type' => $row['ride_type'] === 'pool' ? 'Pool' : 'Individual',
            'driver' => $row['driver_name'] ?: '-',
            'passenger' => $row['passenger_name'] ?: '-',
            'status' => $row['status'],
            'statusKey' => self::statusKey($row['status']),
            'value' => self::formatAoa((float) ($row['fare_final'] ?? 0)),
            'ok' => $row['status'] === 'completed',
            'progress' => in_array($row['status'], ['accepted', 'in_progress', 'pending'], true),
            'cancel' => $row['status'] === 'cancelled',
        ];
    }

    private static function fleetSeries(PDO $conn, int $hours): array
    {
        $stmt = $conn->prepare("
            SELECT ride_type, COUNT(*) AS total
            FROM rides
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
            GROUP BY ride_type
        ");
        $stmt->execute([$hours]);
        $series = ['individual' => 0, 'pool' => 0];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $series[$row['ride_type']] = (int) $row['total'];
        }
        return $series;
    }

    private static function topZones(PDO $conn, string $start, string $end, int $limit): array
    {
        $stmt = $conn->prepare("
            SELECT COALESCE(NULLIF(TRIM(SUBSTRING_INDEX(origin_address, ',', 1)), ''), 'Sem zona') AS zone,
                   COUNT(*) AS trips
            FROM rides
            WHERE created_at BETWEEN ? AND ?
            GROUP BY zone
            ORDER BY trips DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $start);
        $stmt->bindValue(2, $end);
        $stmt->bindValue(3, $limit, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $max = max(1, ...array_map(static fn($r) => (int) $r['trips'], $rows ?: [['trips' => 1]]));
        return array_map(static fn($r) => [
            'name' => $r['zone'],
            'trips' => (int) $r['trips'],
            'tripsLabel' => number_format((int) $r['trips'], 0, ',', '.') . ' viagens',
            'pct' => round(((int) $r['trips'] / $max) * 100),
        ], $rows);
    }

    private static function adoptionByWeekday(PDO $conn, string $start, string $end): array
    {
        $stmt = $conn->prepare("
            SELECT DAYOFWEEK(created_at) AS weekday,
                   COUNT(*) AS total,
                   SUM(CASE WHEN ride_type = 'pool' THEN 1 ELSE 0 END) AS pool_total
            FROM rides
            WHERE created_at BETWEEN ? AND ?
            GROUP BY weekday
        ");
        $stmt->execute([$start, $end]);
        $map = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $map[(int) $row['weekday']] = [
                'total' => (int) $row['total'],
                'pool' => (int) $row['pool_total'],
            ];
        }
        $labels = [2 => 'SEG', 3 => 'TER', 4 => 'QUA', 5 => 'QUI', 6 => 'SEX', 7 => 'SAB', 1 => 'DOM'];
        $result = [];
        foreach ($labels as $day => $label) {
            $total = $map[$day]['total'] ?? 0;
            $pool = $map[$day]['pool'] ?? 0;
            $result[] = [
                'day' => $label,
                'pct' => $total > 0 ? round(($pool / $total) * 100) : 0,
                'total' => $total,
            ];
        }
        return $result;
    }

    private static function averageRating(PDO $conn, string $start, string $end): float
    {
        return round((float) self::scalar($conn, "
            SELECT COALESCE(AVG(NULLIF(driver_rating, 0)), AVG(NULLIF(passenger_rating, 0)), 0)
            FROM rides
            WHERE created_at BETWEEN ? AND ?
        ", [$start, $end]), 1);
    }

    private static function statusKey(string $status): string
    {
        return match ($status) {
            'completed' => 'admin.completed',
            'in_progress' => 'admin.inProgress',
            'cancelled' => 'admin.cancelled',
            'accepted' => 'ride.driverEnRoute',
            default => 'ride.statusProcessing',
        };
    }

    private static function trend(float $current, float $previous): string
    {
        if ($previous <= 0) {
            return $current > 0 ? '+100%' : '0%';
        }
        $pct = (($current - $previous) / $previous) * 100;
        return ($pct >= 0 ? '+' : '') . round($pct, 1) . '%';
    }

    private static function formatAoa(float $value): string
    {
        return number_format(round($value), 0, ',', '.') . ' Kz';
    }

    private static function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $first = substr($parts[0] ?? 'M', 0, 1);
        $last = substr($parts[count($parts) - 1] ?? 'D', 0, 1);
        return strtoupper($first . $last);
    }

    private static function scalar(PDO $conn, string $sql, array $params = []): mixed
    {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }
}
