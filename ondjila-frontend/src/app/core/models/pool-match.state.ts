import { PoolDetails } from './pool.types';

export interface PoolMatchState {
  pool_group_id: number;
  poolPrice: number;
  soloPrice: number;
  originLabel: string;
  destLabel: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  pool_details?: PoolDetails;
  coPassengerName?: string;
  coPassengerRating?: number;
  coPassengerDest?: string;
  extraKm?: string;
  scenario_label?: string;
}
