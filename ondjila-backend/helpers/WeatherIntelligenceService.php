<?php

class WeatherIntelligenceService
{
    public static function current(float $lat, float $lng): array
    {
        $url = 'https://api.open-meteo.com/v1/forecast?' . http_build_query([
            'latitude' => $lat,
            'longitude' => $lng,
            'current' => 'temperature_2m,precipitation,rain,showers,weather_code,wind_speed_10m',
            'timezone' => 'Africa/Luanda',
            'forecast_days' => 1,
        ]);

        $current = null;
        $source = 'simulated';
        $context = stream_context_create(['http' => ['timeout' => 1.8]]);
        $raw = @file_get_contents($url, false, $context);

        if ($raw !== false) {
            $json = json_decode($raw, true);
            if (is_array($json) && isset($json['current'])) {
                $current = $json['current'];
                $source = 'open-meteo';
            }
        }

        if (!$current) {
            $hour = (int) date('G');
            $rain = in_array($hour, [6, 7, 17, 18, 19], true) ? 0.8 : 0.0;
            $current = [
                'precipitation' => $rain,
                'rain' => $rain,
                'showers' => 0,
                'weather_code' => $rain > 0 ? 61 : 2,
                'wind_speed_10m' => 9,
            ];
        }

        $rainMm = (float) (($current['rain'] ?? 0) + ($current['showers'] ?? 0) + ($current['precipitation'] ?? 0));
        $wind = (float) ($current['wind_speed_10m'] ?? 0);
        $code = (int) ($current['weather_code'] ?? 0);

        $multiplier = 1.0;
        $severity = 'clear';
        $reason = null;

        if ($rainMm >= 5 || in_array($code, [65, 66, 67, 80, 81, 82, 95, 96, 99], true)) {
            $multiplier = 1.25;
            $severity = 'heavy_rain';
            $reason = 'Chuva forte aumenta a procura e reduz a velocidade média.';
        } elseif ($rainMm >= 1 || in_array($code, [61, 63], true)) {
            $multiplier = 1.15;
            $severity = 'rain';
            $reason = 'Chuva moderada aumenta o tempo de recolha.';
        } elseif ($wind >= 28) {
            $multiplier = 1.08;
            $severity = 'wind';
            $reason = 'Vento forte pode reduzir a circulação disponível.';
        }

        return [
            'source' => $source,
            'severity' => $severity,
            'rain_mm' => round($rainMm, 2),
            'wind_kmh' => round($wind, 1),
            'weather_code' => $code,
            'multiplier' => $multiplier,
            'reason' => $reason,
        ];
    }
}
