export type PoolScenario =
  | 'same_origin_same_dest'
  | 'diff_origin_same_dest'
  | 'forming';

export type PoolUiState =
  | 'searching_passengers'
  | 'pool_found'
  | 'driver_en_route'
  | 'passenger_picked_up'
  | 'ride_in_progress'
  | 'completed'
  | 'cancelled';

export interface PoolWaypoint {
  type: 'pickup' | 'dropoff';
  lat: number;
  lng: number;
  address?: string;
  order: number;
  passenger_id?: number;
}

export interface PoolCoPassenger {
  passenger_id: number;
  name: string;
  avatar_url?: string | null;
  origin_address: string;
  destination_address: string;
  pickup_order: number;
  pool_status?: string;
}

export interface PoolMyRide {
  id: number;
  fare_individual: number;
  fare_pool: number;
  savings: number;
  discount_pct: number;
  pickup_order: number;
  origin: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
}

export interface PoolRouteData {
  scenario: PoolScenario;
  waypoints: PoolWaypoint[];
  passenger_count: number;
  extra_time_minutes: number;
  total_distance_km: number;
  estimated_duration_min: number;
  pickup_order?: { ride_id: number; passenger_id: number; order: number }[];
}

export interface PoolDetails {
  pool_group_id: number;
  status: string;
  ui_state: PoolUiState;
  scenario: PoolScenario;
  scenario_label: string;
  passenger_count: number;
  max_passengers: number;
  vehicle_type: string;
  route: PoolRouteData | null;
  driver: {
    name: string;
    avatar_url?: string | null;
    vehicle: string;
    plate: string;
    color?: string;
    lat: number | null;
    lng: number | null;
  } | null;
  my_ride: PoolMyRide | null;
  co_passengers: PoolCoPassenger[];
  estimated_duration_min: number | null;
  extra_time_minutes: number;
}

export interface PoolRequestResult {
  match_found: boolean;
  pool_group_id: number;
  scenario?: PoolScenario;
  scenario_label?: string;
  ui_state?: PoolUiState;
  pool_details?: PoolDetails;
  fare_individual?: number;
  estimated_duration_min?: number;
}
