<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../helpers/Response.php';
require_once '../../helpers/Validator.php';
require_once '../../helpers/PoolMatchingHelper.php';
require_once '../../config/jwt.php';

// Idealmente, usaríamos um middleware de Auth, aqui validamos o token básico
$headers = apache_request_headers();
if (!isset($headers['Authorization'])) {
    Response::error('Não autorizado', 401);
}

$token = str_replace('Bearer ', '', $headers['Authorization']);
$payload = JwtHelper::decodeToken($token);
if (!$payload) {
    Response::error('Token inválido ou expirado', 401);
}

$data = json_decode(file_get_contents('php://input'), true);

$errors = Validator::validate($data ?: [], [
    'origin_lat'   => 'required|numeric',
    'origin_lng'   => 'required|numeric',
    'dest_lat'     => 'required|numeric',
    'dest_lng'     => 'required|numeric',
    'vehicle_type' => 'required|in:economy,comfort,xl'
]);

if (!empty($errors)) {
    Response::error('Dados inválidos', 422, $errors);
}

$conn = Database::getInstance()->getConnection();

// Procurar Matches (Carona partilhada existente)
$matches = PoolMatchingHelper::findMatches(
    $conn,
    $data['origin_lat'], $data['origin_lng'],
    $data['dest_lat'], $data['dest_lng'],
    $data['vehicle_type']
);

$conn->beginTransaction();

try {
    if (count($matches) > 0) {
        // MATCH ENCONTRADO - Juntar ao melhor grupo
        $bestMatchId = $matches[0]['id'];
        
        $fareBase = ($data['vehicle_type'] === 'comfort') ? 3500 : 2500;
        $fareOriginal = $fareBase + 500; // Como se fosse sem pool
        
        // Criar a corrida associada ao grupo
        $insertRide = $conn->prepare("
            INSERT INTO rides (passenger_id, pool_group_id, ride_type, origin_address, origin_lat, origin_lng, destination_address, destination_lat, destination_lng, vehicle_type, status, pool_status, fare_estimate, fare_final, fare_original) 
            VALUES (:pass_id, :pool_id, 'pool', 'Origem Match', :o_lat, :o_lng, 'Destino Match', :d_lat, :d_lng, :v_type, 'accepted', 'matched', :fare, :fare, :fare_orig)
        ");
        
        $insertRide->execute([
            ':pass_id' => $payload->sub,
            ':pool_id' => $bestMatchId,
            ':o_lat'   => $data['origin_lat'],
            ':o_lng'   => $data['origin_lng'],
            ':d_lat'   => $data['dest_lat'],
            ':d_lng'   => $data['dest_lng'],
            ':v_type'  => $data['vehicle_type'],
            ':fare'    => $fareBase,
            ':fare_orig' => $fareOriginal
        ]);

        // Atualizar contagem no grupo
        $conn->prepare("UPDATE pool_groups SET current_count = current_count + 1 WHERE id = ?")->execute([$bestMatchId]);
        
        $conn->commit();
        Response::success(['match_found' => true, 'pool_group_id' => $bestMatchId], 'Match de carona encontrado!', 200);

    } else {
        // NENHUM MATCH - Criar novo grupo e esperar
        $insertGroup = $conn->prepare("
            INSERT INTO pool_groups (vehicle_type, status, current_count, max_passengers)
            VALUES (:v_type, 'forming', 1, 3)
        ");
        $insertGroup->execute([':v_type' => $data['vehicle_type']]);
        $newGroupId = $conn->lastInsertId();

        $fareBase = ($data['vehicle_type'] === 'comfort') ? 3500 : 2500;
        $fareOriginal = $fareBase + 500;

        // Criar a corrida
        $insertRide = $conn->prepare("
            INSERT INTO rides (passenger_id, pool_group_id, ride_type, origin_address, origin_lat, origin_lng, destination_address, destination_lat, destination_lng, vehicle_type, status, pool_status, fare_estimate, fare_final, fare_original) 
            VALUES (:pass_id, :pool_id, 'pool', 'Origem', :o_lat, :o_lng, 'Destino', :d_lat, :d_lng, :v_type, 'pending', 'waiting_match', :fare, :fare, :fare_orig)
        ");
        
        $insertRide->execute([
            ':pass_id' => $payload->sub,
            ':pool_id' => $newGroupId,
            ':o_lat'   => $data['origin_lat'],
            ':o_lng'   => $data['origin_lng'],
            ':d_lat'   => $data['dest_lat'],
            ':d_lng'   => $data['dest_lng'],
            ':v_type'  => $data['vehicle_type'],
            ':fare'    => $fareBase,
            ':fare_orig' => $fareOriginal
        ]);

        $conn->commit();
        Response::success(['match_found' => false, 'pool_group_id' => $newGroupId], 'A procurar parceiros de viagem...', 201);
    }
} catch (Exception $e) {
    $conn->rollBack();
    Response::error('Erro ao processar pedido de carona: ' . $e->getMessage(), 500);
}
