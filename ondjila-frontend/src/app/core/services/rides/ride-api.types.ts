import { PoolDetails, PoolRequestResult, PoolRouteData, PoolUiState } from '../../models/pool.types';
import { PricingQuote } from '../pricing/pricing.types';

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
  payment_method?: 'wallet' | 'multicaixa' | 'cash' | null;
  is_paid?: boolean;
  distance_km?: number;
  duration_minutes?: number | null;
  surge_multiplier?: number;
  fare_breakdown?: PricingQuote | null;
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
  ride_type?: 'individual' | 'pool';
  status: 'pending' | 'accepted' | 'forming' | 'active' | 'in_progress' | 'completed' | string;
  current_count: number;
  max_passengers: number;
  origin_address: string;
  destination_address: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  distance_km?: number | null;
  duration_minutes?: number | null;
  fare_final?: number | null;
  distance_to_pickup_km?: number | null;
  route?: PoolRouteData | null;
}

export interface DriverAvailableRidesData {
  rides: DriverRide[];
  location_required?: boolean;
  pickup_radius_km?: number;
}

export interface DriverAvailablePoolsData {
  pools: DriverRide[];
  location_required?: boolean;
  pickup_radius_km?: number;
}

export interface PoolRequest {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  vehicle_type: string;
  origin_address?: string;
  destination_address?: string;
  pricing_quote_id?: number | null;
}

export interface IndividualRideRequest extends PoolRequest {}

export interface IndividualRideRequestResult {
  ride_id: number;
  ride_type: 'individual';
  fare_estimate: number;
  distance_km: number;
  duration_minutes: number;
  pricing?: PricingQuote;
}

export type { PoolRequestResult };
