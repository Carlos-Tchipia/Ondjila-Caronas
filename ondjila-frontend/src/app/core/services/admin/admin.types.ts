export interface AdminKpi {
  key: string;
  labelKey: string;
  value: number;
  formatted: string;
  trend: string;
  color: string;
}

export interface AdminActivity {
  id: string;
  type: string;
  driver: string;
  passenger: string;
  status: string;
  statusKey: string;
  value: string;
  ok: boolean;
  progress: boolean;
  cancel: boolean;
}

export interface AdminOverview {
  kpis: AdminKpi[];
  fleet: { individual: number; pool: number };
  zones: AdminDistrict[];
  activity: AdminActivity[];
}

export interface AdminReportMetric {
  key: string;
  labelKey: string;
  value: number;
  formatted: string;
  trend: string;
  highlight?: boolean;
}

export interface AdminDistrict {
  name: string;
  trips: number;
  tripsLabel: string;
  pct: number;
}

export interface AdminReport {
  range: {
    start_date: string;
    end_date: string;
    days: number;
  };
  metrics: AdminReportMetric[];
  totals: {
    total_rides: number;
    completed_rides: number;
    pool_rides: number;
    individual_rides: number;
    pool_adoption_pct: number;
    co2_saved_ton: number;
    average_rating: number;
  };
  top_districts: AdminDistrict[];
  adoption: Array<{ day: string; pct: number; total: number }>;
  activity: AdminActivity[];
}

export interface AdminDriver {
  id: number;
  display_id: string;
  name: string;
  initials: string;
  email: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended' | string;
  is_available: boolean;
  plate: string;
  vehicle: string;
  vehicle_type: string;
  date: string;
  docs: number;
  docsTotal: number;
}

export interface AdminDriverDecisionResponse {
  driver: AdminDriver;
  summary: AdminDriversResponse['summary'];
}

export interface AdminDriversResponse {
  summary: {
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    online: number;
    total: number;
  };
  drivers: AdminDriver[];
}

export interface AdminSectionMetric {
  labelKey: string;
  value: string;
  trend: string;
  good?: boolean;
}

export interface AdminSectionRow {
  name: string;
  status: string;
  value: string;
}

export interface AdminSectionResponse {
  metrics: AdminSectionMetric[];
  rows: AdminSectionRow[];
}

export interface AdminLiveMapDriver {
  id: number;
  name: string;
  vehicle: string;
  vehicle_type: string;
  plate: string;
  is_available: boolean;
  current_lat: number | null;
  current_lng: number | null;
}

export interface AdminLiveMapRide {
  id: number;
  ride_type: 'individual' | 'pool' | string;
  status: string;
  origin_address: string;
  destination_address: string;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  driver_name: string | null;
  passenger_name: string;
}

export interface AdminLiveMapResponse {
  drivers: AdminLiveMapDriver[];
  rides: AdminLiveMapRide[];
}
