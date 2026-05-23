export interface PricingReason {
  code: string;
  label: string;
  impact: string;
}

export interface PricingQuote {
  quote_id: number | null;
  ride_type: 'individual' | 'pool' | string;
  vehicle_type: 'economy' | 'comfort' | 'xl' | string;
  region: string;
  distance_km: number;
  duration_minutes: number;
  stopped_minutes: number;
  average_speed_kmh: number;
  base_fare: number;
  final_fare: number;
  surge_multiplier: number;
  multipliers: Record<string, number>;
  factors: {
    extras?: Record<string, number>;
    traffic?: Record<string, unknown>;
    weather?: Record<string, unknown>;
    demand_supply?: Record<string, unknown>;
  };
  reasons: PricingReason[];
  transparent_summary: {
    formula: string;
    base_component: number;
    multiplier_component: number;
    extras_total: number;
    final_fare: number;
  };
}

export interface PricingQuoteRequest {
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  vehicle_type: string;
  ride_type?: 'individual' | 'pool';
}

export interface PricingControls {
  enabled: boolean;
  min_multiplier: number;
  max_multiplier: number;
  manual_multiplier: number;
  weather_enabled: boolean;
  traffic_enabled: boolean;
  demand_enabled: boolean;
  events_enabled: boolean;
  night_fee: number;
  busy_zone_fee: number;
  holiday_multiplier: number;
}

export interface PricingMetrics {
  summary: {
    total_quotes: number;
    avg_fare: number;
    avg_multiplier: number;
    max_multiplier: number;
  };
  zones: Array<{
    region: string;
    quotes: number;
    avg_multiplier: number;
    avg_fare: number;
  }>;
  history: Array<{
    id: number;
    region: string;
    vehicle_type: string;
    distance_km: number;
    duration_minutes: number;
    final_fare: number;
    surge_multiplier: number;
    reasons: PricingReason[];
    created_at: string;
  }>;
}
