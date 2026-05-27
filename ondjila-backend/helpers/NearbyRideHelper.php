<?php
require_once __DIR__ . '/HaversineHelper.php';

class NearbyRideHelper {
    public const PICKUP_RADIUS_KM = 6.5;
    private const FALLBACK_LAT = -8.8147;
    private const FALLBACK_LNG = 13.2302;

    public static function driverLocation(array $driver): ?array {
        if ($driver['current_lat'] === null || $driver['current_lng'] === null) {
            return self::fallbackLocation();
        }

        $lat = (float) $driver['current_lat'];
        $lng = (float) $driver['current_lng'];

        if (!self::isValidCoordinate($lat, $lng)) {
            return self::fallbackLocation();
        }

        return ['lat' => $lat, 'lng' => $lng];
    }

    public static function isValidCoordinate(float $lat, float $lng): bool {
        return is_finite($lat)
            && is_finite($lng)
            && $lat >= -90
            && $lat <= 90
            && $lng >= -180
            && $lng <= 180
            && !($lat == 0.0 && $lng == 0.0);
    }

    public static function distanceToPickup(array $driverLocation, array $ride): float {
        return HaversineHelper::distance(
            (float) $driverLocation['lat'],
            (float) $driverLocation['lng'],
            (float) $ride['origin_lat'],
            (float) $ride['origin_lng']
        );
    }

    public static function isWithinPickupRadius(array $driverLocation, array $ride): bool {
        return self::distanceToPickup($driverLocation, $ride) <= self::PICKUP_RADIUS_KM;
    }

    private static function fallbackLocation(): array {
        return ['lat' => self::FALLBACK_LAT, 'lng' => self::FALLBACK_LNG];
    }
}
