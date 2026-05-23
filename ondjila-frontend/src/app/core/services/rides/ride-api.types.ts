import { PoolDetails, PoolRequestResult, PoolRouteData, PoolUiState } from '../../models/pool.types';

export interface PassengerRide {
  id: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | string;
  ride_type?: 'individual' | 'pool';
  pool_group_id: number | null;
  pool_status: string | null;
  pool_group_status?: string | null;
  ui_state?: PoolUiState;
  origin_address?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_address?: string;
  destination_lat?: number;
  destination_lng?: number;
  fare_final?: number;
  fare_original?: number;
  savings?: number;
  pickup_order?: number;
  passenger_count?: number;
  max_passengers?: number;
  driver_id: number | null;
  driver_name: string | null;
  driver_avatar: string | null;
  driver_lat?: number | null;
  driver_lng?: number | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_plate: string | null;
  vehicle_color: string | null;
  route?: PoolRouteData | null;
  pool?: PoolDetails | null;
}

export interface DriverRide {
  id: number;
  status: 'forming' | 'active' | 'in_progress' | 'completed' | string;
  current_count: number;
  max_passengers: number;
  origin_address: string;
  destination_address: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  route?: PoolRouteData | null;
}

export interface PoolRequest {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  vehicle_type: string;
  origin_address?: string;
  destination_address?: string;
}

export type { PoolRequestResult };
