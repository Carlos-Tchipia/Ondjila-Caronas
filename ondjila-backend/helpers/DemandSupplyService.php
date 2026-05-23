<?php
require_once __DIR__ . '/HaversineHelper.php';

class DemandSupplyService
{
    public static function snapshot(PDO $conn, float $lat, float $lng, string $vehicleType, ?int $passengerId = null): array
    {
        $pendingDemand = self::countRecentRides($conn, $vehicleType);
        $availableDrivers = self::countNearbyDrivers($conn, $lat, $lng, $vehicleType);
        $cancelRate = $passengerId ? self::passengerCancelRate($conn, $passengerId) : 0.0;

        $ratio = $pendingDemand / max(1, $availableDrivers);
        $multiplier = 1.0;
        if ($ratio >= 4) {
            $multiplier = 1.42;
        } elseif ($ratio >= 2.5) {
            $multiplier = 1.28;
        } elseif ($ratio >= 1.4) {
            $multiplier = 1.16;
        } elseif ($availableDrivers >= ($pendingDemand + 8)) {
            $multiplier = 0.94;
        }

        if ($availableDrivers <= 2) {
            $multiplier += 0.12;
        }

        return [
            'pending_rides_20m' => $pendingDemand,
            'available_drivers_nearby' => $availableDrivers,
            'demand_supply_ratio' => round($ratio, 2),
            'passenger_cancel_rate_14d' => $cancelRate,
            'multiplier' => round(min(1.48, max(0.92, $multiplier)), 2),
            'cancellation_multiplier' => round(1 + min(0.12, $cancelRate * 0.18), 2),
        ];
    }

    private static function countRecentRides(PDO $conn, string $vehicleType): int
    {
        $stmt = $conn->prepare("
            SELECT COUNT(*)
            FROM rides
            WHERE vehicle_type = ?
              AND status IN ('pending','accepted')
              AND created_at >= DATE_SUB(NOW(), INTERVAL 20 MINUTE)
        ");
        $stmt->execute([$vehicleType]);
        return (int) $stmt->fetchColumn();
    }

    private static function countNearbyDrivers(PDO $conn, float $lat, float $lng, string $vehicleType): int
    {
        $stmt = $conn->prepare("
            SELECT current_lat, current_lng
            FROM drivers
            WHERE approval_status = 'approved'
              AND is_available = 1
              AND vehicle_type = ?
              AND current_lat IS NOT NULL
              AND current_lng IS NOT NULL
            LIMIT 250
        ");
        $stmt->execute([$vehicleType]);
        $count = 0;

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $driver) {
            $distance = HaversineHelper::distance($lat, $lng, (float) $driver['current_lat'], (float) $driver['current_lng']);
            if ($distance <= 6.5) {
                $count++;
            }
        }

        return $count;
    }

    private static function passengerCancelRate(PDO $conn, int $passengerId): float
    {
        $stmt = $conn->prepare("
            SELECT
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
                COUNT(*) AS total
            FROM rides
            WHERE passenger_id = ?
              AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        ");
        $stmt->execute([$passengerId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['cancelled' => 0, 'total' => 0];
        $total = max(1, (int) $row['total']);
        return round(((int) $row['cancelled']) / $total, 2);
    }
}
