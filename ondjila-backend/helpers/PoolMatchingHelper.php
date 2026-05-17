<?php
require_once __DIR__ . '/HaversineHelper.php';

class PoolMatchingHelper {

    /**
     * Encontra corridas pool compatíveis para um novo passageiro.
     * 1. Status do grupo tem que ser 'forming' ou 'active'
     * 2. Tem que ter espaço (current_count < max_passengers)
     * 3. A origem do novo passageiro deve estar até 2km da origem do motorista ou da rota
     * 4. A direção deve ser semelhante (< 45 graus)
     */
    public static function findMatches(
        PDO $conn,
        float $originLat, float $originLng,
        float $destLat,   float $destLng,
        string $vehicleType
    ): array {
        
        // Calcular o angulo do novo passageiro
        $newPassengerBearing = self::calculateBearing($originLat, $originLng, $destLat, $destLng);

        // Obter grupos ativos com espaço
        $stmt = $conn->prepare("
            SELECT pg.*, r.origin_lat as first_origin_lat, r.origin_lng as first_origin_lng, 
                   r.destination_lat as first_dest_lat, r.destination_lng as first_dest_lng
            FROM pool_groups pg
            JOIN rides r ON r.pool_group_id = pg.id
            WHERE pg.status IN ('forming', 'active')
              AND pg.current_count < pg.max_passengers
              AND pg.vehicle_type = :v_type
            GROUP BY pg.id
        ");
        $stmt->execute([':v_type' => $vehicleType]);
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $matches = [];

        foreach ($groups as $group) {
            $groupBearing = self::calculateBearing(
                $group['first_origin_lat'], $group['first_origin_lng'],
                $group['first_dest_lat'], $group['first_dest_lng']
            );

            // 1. Verificar direção (max 45 graus de desvio)
            $diffBearing = abs($newPassengerBearing - $groupBearing);
            if ($diffBearing > 180) {
                $diffBearing = 360 - $diffBearing;
            }

            if ($diffBearing > 45) {
                continue; // Vai noutra direção
            }

            // 2. Verificar distância à origem
            $distanceToGroupOrigin = HaversineHelper::distance(
                $originLat, $originLng,
                $group['first_origin_lat'], $group['first_origin_lng']
            );

            if ($distanceToGroupOrigin <= 2.0) { // Raio de 2km
                $group['deviation_score'] = $diffBearing + ($distanceToGroupOrigin * 10);
                $matches[] = $group;
            }
        }

        // Ordenar pelo menor desvio (score)
        usort($matches, function($a, $b) {
            return $a['deviation_score'] <=> $b['deviation_score'];
        });

        return $matches;
    }

    /**
     * Calcula o ângulo de direção entre 2 pontos (Bearing)
     */
    public static function calculateBearing(float $lat1, float $lng1, float $lat2, float $lng2): float {
        $lat1 = deg2rad($lat1);
        $lng1 = deg2rad($lng1);
        $lat2 = deg2rad($lat2);
        $lng2 = deg2rad($lng2);

        $dLng = $lng2 - $lng1;
        $y = sin($dLng) * cos($lat2);
        $x = cos($lat1) * sin($lat2) - sin($lat1) * cos($lat2) * cos($dLng);
        
        $brng = atan2($y, $x);
        return fmod((rad2deg($brng) + 360), 360);
    }
}
