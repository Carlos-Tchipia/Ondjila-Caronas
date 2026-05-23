<?php
require_once __DIR__ . '/HaversineHelper.php';
require_once __DIR__ . '/CityZoneHelper.php';

class TrafficIntelligenceService
{
    public static function estimate(float $originLat, float $originLng, float $destLat, float $destLng): array
    {
        $directKm = HaversineHelper::distance($originLat, $originLng, $destLat, $destLng);
        $originZone = CityZoneHelper::detect($originLat, $originLng);
        $destZone = CityZoneHelper::detect($destLat, $destLng);

        $hour = (int) date('G');
        $weekday = (int) date('N');
        $isWeekend = $weekday >= 6;
        $isPeak = !$isWeekend && (($hour >= 6 && $hour <= 9) || ($hour >= 16 && $hour <= 19));
        $isNight = $hour >= 22 || $hour <= 5;

        $roadFactor = 1.18 + ($originZone['is_busy_zone'] ? 0.05 : 0) + ($destZone['is_busy_zone'] ? 0.03 : 0);
        $distanceKm = max(0.8, round($directKm * $roadFactor, 2));

        $baseSpeed = $isPeak ? 18 : ($isNight ? 34 : 27);
        if ($isWeekend && $hour >= 19) {
            $baseSpeed -= 4;
        }
        if ($originZone['is_busy_zone'] || $destZone['is_busy_zone']) {
            $baseSpeed -= 3;
        }

        $avgSpeed = max(12, $baseSpeed);
        $congestionScore = 0.18;
        if ($isPeak) $congestionScore += 0.34;
        if ($originZone['is_busy_zone']) $congestionScore += 0.12;
        if ($destZone['is_busy_zone']) $congestionScore += 0.08;
        if ($isWeekend && $hour >= 19) $congestionScore += 0.12;
        if ($isNight) $congestionScore = max(0.08, $congestionScore - 0.08);
        $congestionScore = min(0.92, $congestionScore);

        $movingMinutes = ($distanceKm / $avgSpeed) * 60;
        $stoppedMinutes = (int) round($movingMinutes * ($congestionScore * 0.35));
        $durationMinutes = (int) max(5, round($movingMinutes + $stoppedMinutes + 4));

        $multiplier = 1 + min(0.42, $congestionScore * 0.45);

        return [
            'distance_km' => $distanceKm,
            'duration_minutes' => $durationMinutes,
            'stopped_minutes' => $stoppedMinutes,
            'average_speed_kmh' => round($avgSpeed, 1),
            'congestion_score' => round($congestionScore, 2),
            'multiplier' => round($multiplier, 2),
            'is_peak' => $isPeak,
            'is_night' => $isNight,
            'is_weekend' => $isWeekend,
            'origin_zone' => $originZone,
            'destination_zone' => $destZone,
        ];
    }
}
