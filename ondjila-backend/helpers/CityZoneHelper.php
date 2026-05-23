<?php
require_once __DIR__ . '/HaversineHelper.php';

class CityZoneHelper
{
    private const ZONES = [
        ['name' => 'Mutamba / Baixa', 'lat' => -8.8147, 'lng' => 13.2302, 'radius' => 2.8, 'factor' => 1.14, 'event' => 1.08],
        ['name' => 'Ilha de Luanda', 'lat' => -8.7767, 'lng' => 13.2457, 'radius' => 4.0, 'factor' => 1.16, 'event' => 1.16],
        ['name' => 'Maianga / Alvalade', 'lat' => -8.8477, 'lng' => 13.2256, 'radius' => 4.2, 'factor' => 1.10, 'event' => 1.06],
        ['name' => 'Aeroporto', 'lat' => -8.8584, 'lng' => 13.2312, 'radius' => 3.0, 'factor' => 1.15, 'event' => 1.08],
        ['name' => 'Talatona', 'lat' => -8.9167, 'lng' => 13.1833, 'radius' => 5.5, 'factor' => 1.12, 'event' => 1.10],
        ['name' => 'Kilamba', 'lat' => -8.9983, 'lng' => 13.2675, 'radius' => 6.0, 'factor' => 1.06, 'event' => 1.04],
        ['name' => 'Viana', 'lat' => -8.9042, 'lng' => 13.3718, 'radius' => 6.5, 'factor' => 1.09, 'event' => 1.05],
        ['name' => 'Cacuaco', 'lat' => -8.7935, 'lng' => 13.3665, 'radius' => 6.5, 'factor' => 1.07, 'event' => 1.04],
    ];

    public static function detect(float $lat, float $lng): array
    {
        $best = null;
        $bestDistance = PHP_FLOAT_MAX;

        foreach (self::ZONES as $zone) {
            $distance = HaversineHelper::distance($lat, $lng, $zone['lat'], $zone['lng']);
            if ($distance < $bestDistance) {
                $best = $zone;
                $bestDistance = $distance;
            }
        }

        if ($best && $bestDistance <= $best['radius']) {
            return [
                'name' => $best['name'],
                'distance_km' => round($bestDistance, 2),
                'busy_factor' => $best['factor'],
                'event_factor' => $best['event'],
                'is_busy_zone' => $best['factor'] > 1.08,
            ];
        }

        return [
            'name' => DYNAMIC_PRICING_DEFAULT_CITY,
            'distance_km' => round($bestDistance, 2),
            'busy_factor' => 1.0,
            'event_factor' => 1.0,
            'is_busy_zone' => false,
        ];
    }
}
