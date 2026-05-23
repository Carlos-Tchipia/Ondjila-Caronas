<?php
require_once __DIR__ . '/../config/constants.php';

class PricingControlService
{
    public static function defaults(): array
    {
        return [
            'enabled' => true,
            'min_multiplier' => DYNAMIC_PRICING_MIN_MULTIPLIER,
            'max_multiplier' => DYNAMIC_PRICING_MAX_MULTIPLIER,
            'manual_multiplier' => 1.0,
            'weather_enabled' => true,
            'traffic_enabled' => true,
            'demand_enabled' => true,
            'events_enabled' => true,
            'night_fee' => 180,
            'busy_zone_fee' => 120,
            'holiday_multiplier' => 1.18,
        ];
    }

    public static function get(PDO $conn): array
    {
        $defaults = self::defaults();
        $stmt = $conn->prepare("SELECT control_value, is_enabled FROM pricing_controls WHERE control_key = 'dynamic_pricing'");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            self::save($conn, $defaults, null);
            return $defaults;
        }

        $stored = json_decode($row['control_value'], true);
        if (!is_array($stored)) {
            $stored = [];
        }

        $controls = array_merge($defaults, $stored);
        $controls['enabled'] = (bool) $row['is_enabled'] && (bool) $controls['enabled'];
        $controls['min_multiplier'] = max(0.7, min(1.2, (float) $controls['min_multiplier']));
        $controls['max_multiplier'] = max(1.1, min(3.0, (float) $controls['max_multiplier']));
        $controls['manual_multiplier'] = max(0.8, min(1.6, (float) $controls['manual_multiplier']));

        return $controls;
    }

    public static function save(PDO $conn, array $controls, ?int $adminId): array
    {
        $merged = array_merge(self::defaults(), $controls);
        $enabled = !empty($merged['enabled']) ? 1 : 0;
        $json = json_encode($merged, JSON_UNESCAPED_UNICODE);

        $stmt = $conn->prepare("
            INSERT INTO pricing_controls (control_key, control_value, is_enabled, updated_by)
            VALUES ('dynamic_pricing', :value, :enabled, :admin_id)
            ON DUPLICATE KEY UPDATE
                control_value = VALUES(control_value),
                is_enabled = VALUES(is_enabled),
                updated_by = VALUES(updated_by)
        ");
        $stmt->execute([
            ':value' => $json,
            ':enabled' => $enabled,
            ':admin_id' => $adminId,
        ]);

        return self::get($conn);
    }
}
