// Asset allocation types for investment platform

export interface AllocationBase {
  client_id: number;
  asset_id: number;
  quantity: number;
  buy_price: number;
  buy_date: string; // ISO date string
}

export interface AllocationCreate extends AllocationBase {}

export interface AllocationUpdate {
  quantity?: number;
  buy_price?: number;
  buy_date?: string;
}

export interface Allocation extends AllocationBase {
  id: number;
}

export interface AllocationWithDetails extends Allocation {
  client_name: string;
  asset_ticker: string;
  asset_name: string;
  total_invested: number;
}

export interface AllocationFilters {
  client_id?: number;
  asset_id?: number;
  skip?: number;
  limit?: number;
}

// Summary and analytics types
export interface AllocationSummary {
  total_allocations: number;
  total_invested: number;
  unique_clients: number;
  unique_assets: number;
}

export interface ClientAllocationSummary {
  client_id: number;
  client_name: string;
  total_allocated: number;
  total_invested: number;
  asset_count: number;
  allocations: AllocationWithDetails[];
}