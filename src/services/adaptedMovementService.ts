import { apiClient } from '../lib/api';

export interface MovementService {
  getMovements: (filters?: MovementFilters) => Promise<MovementWithClient[]>;
  getMovement: (id: string) => Promise<MovementWithClient>;
  createMovement: (movement: MovementCreate) => Promise<MovementWithClient>;
  updateMovement: (id: string, movement: Partial<MovementCreate>) => Promise<MovementWithClient>;
  deleteMovement: (id: number) => Promise<void>;
  getMovementsSummary: () => Promise<MovementSummary>;
}

export interface MovementFilters {
  client_id?: number;
  start_date?: string;
  end_date?: string;
  type?: string;
}

export interface MovementCreate {
  client_id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  note?: string;
}

export interface MovementWithClient {
  id: number;
  client_id: number;
  client_name: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  note?: string;
}

export interface MovementSummary {
  total_deposits: number;
  total_withdrawals: number;
  net_amount: number;
  total_movements: number;
}

class RealMovementService implements MovementService {
  async getMovements(filters?: MovementFilters): Promise<MovementWithClient[]> {
    const params = new URLSearchParams();
    
    if (filters?.client_id) params.append('client_id', filters.client_id.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const url = queryString ? `/movements?${queryString}` : '/movements';
    
    const backendMovements = await apiClient.get<any[]>(url);
    
    // Convert backend format to frontend format
    return backendMovements.map(bm => ({
      id: bm.id,
      client_id: bm.client_id,
      client_name: bm.client_name,
      type: bm.type,
      amount: parseFloat(bm.amount),
      date: bm.date,
      note: bm.note,
    }));
  }

  async getMovement(id: string): Promise<MovementWithClient> {
    const backendMovement = await apiClient.get<any>(`/movements/${id}`);
    
    return {
      id: backendMovement.id,
      client_id: backendMovement.client_id,
      client_name: backendMovement.client_name,
      type: backendMovement.type,
      amount: parseFloat(backendMovement.amount),
      date: backendMovement.date,
      note: backendMovement.note,
    };
  }

  async createMovement(movement: MovementCreate): Promise<MovementWithClient> {
    const backendData = {
      client_id: movement.client_id,
      type: movement.type,
      amount: movement.amount,
      date: movement.date,
      note: movement.note,
    };

    const backendMovement = await apiClient.post<any>('/movements', backendData);
    
    return {
      id: backendMovement.id,
      client_id: backendMovement.client_id,
      client_name: backendMovement.client_name,
      type: backendMovement.type,
      amount: parseFloat(backendMovement.amount),
      date: backendMovement.date,
      note: backendMovement.note,
    };
  }

  async updateMovement(id: string, movement: Partial<MovementCreate>): Promise<MovementWithClient> {
    const backendData: any = {};
    
    if (movement.client_id !== undefined) backendData.client_id = movement.client_id;
    if (movement.type !== undefined) backendData.type = movement.type;
    if (movement.amount !== undefined) backendData.amount = movement.amount;
    if (movement.date !== undefined) backendData.date = movement.date;
    if (movement.note !== undefined) backendData.note = movement.note;

    const backendMovement = await apiClient.put<any>(`/movements/${id}`, backendData);
    
    return {
      id: backendMovement.id,
      client_id: backendMovement.client_id,
      client_name: backendMovement.client_name,
      type: backendMovement.type,
      amount: parseFloat(backendMovement.amount),
      date: backendMovement.date,
      note: backendMovement.note,
    };
  }

  async deleteMovement(id: number): Promise<void> {
    return apiClient.delete<void>(`/movements/${id}`);
  }

  async getMovementsSummary(): Promise<MovementSummary> {
    // Get summary data and movements count separately
    const [summary, movements] = await Promise.all([
      apiClient.get<any>('/movements/captation-total'),
      apiClient.get<any[]>('/movements')
    ]);
    
    return {
      total_deposits: parseFloat(summary.total_deposits || '0'),
      total_withdrawals: parseFloat(summary.total_withdrawals || '0'),
      net_amount: parseFloat(summary.net_captation || '0'), // Note: backend uses 'net_captation'
      total_movements: movements.length,
    };
  }
}

// Export the real service
export const movementService = new RealMovementService();

// Export as adaptedMovementService for compatibility
export const adaptedMovementService = new RealMovementService();