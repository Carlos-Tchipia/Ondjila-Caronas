export interface PassengerRide {
  id: number;
  status: 'pending' | 'accepted' | 'in_progress' | string;
  pool_group_id: number;
  pool_status: string | null;
  driver_id: number | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  vehicle_color: string | null;
  driver_name: string | null;
  driver_avatar: string | null;
}

export interface DriverRide {
  id: number;
  status: 'active' | 'in_progress' | string;
  current_count: number;
  max_passengers: number;
  origin_address: string;
  destination_address: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
}

export interface PoolRequest {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  vehicle_type: string;
}

export interface PoolRequestResult {
  match_found: boolean;
  pool_group_id: number;
}
