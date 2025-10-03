import { apiClient } from '../lib/api';
import type { 
  AllocationCreate, 
  AllocationUpdate, 
  Allocation, 
  AllocationWithDetails, 
  AllocationFilters,
  AllocationSummary,
  ClientAllocationSummary 
} from '../types/allocation';

export interface AllocationService {
  getAllocations: (filters?: AllocationFilters) => Promise<AllocationWithDetails[]>;
  getAllocation: (id: number) => Promise<AllocationWithDetails>;
  createAllocation: (allocation: AllocationCreate) => Promise<Allocation>;
  updateAllocation: (id: number, allocation: AllocationUpdate) => Promise<Allocation>;
  deleteAllocation: (id: number) => Promise<void>;
  getAllocationsByClient: (clientId: number) => Promise<AllocationWithDetails[]>;
  getAllocationSummary: () => Promise<AllocationSummary>;
  getClientAllocationSummary: (clientId: number) => Promise<ClientAllocationSummary>;
}

class RealAllocationService implements AllocationService {
  async getAllocations(filters?: AllocationFilters): Promise<AllocationWithDetails[]> {
    const params = new URLSearchParams();
    
    if (filters?.client_id) params.append('client_id', filters.client_id.toString());
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/allocations?${queryString}` : '/allocations';
    
    const backendAllocations = await apiClient.get<any[]>(url);
    
    // Convert backend format to frontend format
    return backendAllocations.map(ba => ({
      id: ba.id,
      client_id: ba.client_id,
      asset_id: ba.asset_id,
      quantity: parseFloat(ba.quantity),
      buy_price: parseFloat(ba.buy_price),
      buy_date: ba.buy_date,
      client_name: ba.client_name,
      asset_ticker: ba.asset_ticker,
      asset_name: ba.asset_name,
      total_invested: parseFloat(ba.total_invested),
    }));
  }

  async getAllocation(id: number): Promise<AllocationWithDetails> {
    const backendAllocation = await apiClient.get<any>(`/allocations/${id}`);
    
    return {
      id: backendAllocation.id,
      client_id: backendAllocation.client_id,
      asset_id: backendAllocation.asset_id,
      quantity: parseFloat(backendAllocation.quantity),
      buy_price: parseFloat(backendAllocation.buy_price),
      buy_date: backendAllocation.buy_date,
      client_name: backendAllocation.client_name,
      asset_ticker: backendAllocation.asset_ticker,
      asset_name: backendAllocation.asset_name,
      total_invested: parseFloat(backendAllocation.total_invested),
    };
  }

  async createAllocation(allocation: AllocationCreate): Promise<Allocation> {
    const backendData = {
      client_id: allocation.client_id,
      asset_id: allocation.asset_id,
      quantity: allocation.quantity,
      buy_price: allocation.buy_price,
      buy_date: allocation.buy_date,
    };

    const backendAllocation = await apiClient.post<any>('/allocations', backendData);
    
    return {
      id: backendAllocation.id,
      client_id: backendAllocation.client_id,
      asset_id: backendAllocation.asset_id,
      quantity: parseFloat(backendAllocation.quantity),
      buy_price: parseFloat(backendAllocation.buy_price),
      buy_date: backendAllocation.buy_date,
    };
  }

  async updateAllocation(id: number, allocation: AllocationUpdate): Promise<Allocation> {
    const backendData: any = {};
    
    if (allocation.quantity !== undefined) backendData.quantity = allocation.quantity;
    if (allocation.buy_price !== undefined) backendData.buy_price = allocation.buy_price;
    if (allocation.buy_date !== undefined) backendData.buy_date = allocation.buy_date;

    const backendAllocation = await apiClient.put<any>(`/allocations/${id}`, backendData);
    
    return {
      id: backendAllocation.id,
      client_id: backendAllocation.client_id,
      asset_id: backendAllocation.asset_id,
      quantity: parseFloat(backendAllocation.quantity),
      buy_price: parseFloat(backendAllocation.buy_price),
      buy_date: backendAllocation.buy_date,
    };
  }

  async deleteAllocation(id: number): Promise<void> {
    return apiClient.delete<void>(`/allocations/${id}`);
  }

  async getAllocationsByClient(clientId: number): Promise<AllocationWithDetails[]> {
    const backendAllocations = await apiClient.get<any[]>(`/allocations/client/${clientId}`);
    
    return backendAllocations.map(ba => ({
      id: ba.id,
      client_id: ba.client_id,
      asset_id: ba.asset_id,
      quantity: parseFloat(ba.quantity),
      buy_price: parseFloat(ba.buy_price),
      buy_date: ba.buy_date,
      client_name: ba.client_name,
      asset_ticker: ba.asset_ticker,
      asset_name: ba.asset_name,
      total_invested: parseFloat(ba.total_invested),
    }));
  }

  async getAllocationSummary(): Promise<AllocationSummary> {
    // Get all allocations and calculate summary
    const allocations = await this.getAllocations();
    
    const uniqueClients = new Set(allocations.map(a => a.client_id)).size;
    const uniqueAssets = new Set(allocations.map(a => a.asset_id)).size;
    const totalInvested = allocations.reduce((sum, a) => sum + a.total_invested, 0);
    
    return {
      total_allocations: allocations.length,
      total_invested: totalInvested,
      unique_clients: uniqueClients,
      unique_assets: uniqueAssets,
    };
  }

  async getClientAllocationSummary(clientId: number): Promise<ClientAllocationSummary> {
    const allocations = await this.getAllocationsByClient(clientId);
    
    if (allocations.length === 0) {
      throw new Error('No allocations found for this client');
    }
    
    const totalInvested = allocations.reduce((sum, a) => sum + a.total_invested, 0);
    const totalAllocated = allocations.reduce((sum, a) => sum + a.quantity, 0);
    
    return {
      client_id: clientId,
      client_name: allocations[0]?.client_name || 'Unknown Client',
      total_allocated: totalAllocated,
      total_invested: totalInvested,
      asset_count: allocations.length,
      allocations: allocations,
    };
  }
}

// Export the real service
export const allocationService = new RealAllocationService();

// Export as adaptedAllocationService for compatibility
export const adaptedAllocationService = new RealAllocationService();