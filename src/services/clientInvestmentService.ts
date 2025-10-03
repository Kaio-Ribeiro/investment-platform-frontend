import { allocationService } from './adaptedAllocationService';
import { movementService } from './movementService';
import type { ClientInvestmentStats } from '../types/client';
import type { MovementWithClient } from '../types/movement';

export class ClientInvestmentService {
  /**
   * Get investment statistics for a specific client
   */
  async getClientInvestmentStats(clientId: string): Promise<ClientInvestmentStats> {
    try {
      // Get client allocations
      const allocations = await allocationService.getAllocationsByClient(parseInt(clientId));
      
      // Get client balance and movements
      const balance = await movementService.getClientBalance(clientId);
      
      // Get client movements to calculate total deposits
      const movements = await movementService.getClientMovements(clientId, 1, 1000); // Get many movements
      const totalDeposits = movements.movements
        .filter((movement: MovementWithClient) => movement.type === 'deposit' && movement.status === 'completed')
        .reduce((sum: number, movement: MovementWithClient) => sum + movement.amount, 0);
      
      // Calculate statistics
      const totalAllocations = allocations.length;
      
      // Net balance from movements (available balance represents deposits - withdrawals)
      const netBalance = balance.totalBalance;
      
      // Find last investment date
      const lastInvestmentDate = allocations.length > 0 
        ? allocations.reduce((latest, allocation) => 
            new Date(allocation.buy_date) > new Date(latest) ? allocation.buy_date : latest, 
            allocations[0].buy_date
          )
        : undefined;

      return {
        client_id: clientId,
        total_allocations: totalAllocations,
        total_invested: totalDeposits, // Total deposits instead of allocation values
        net_balance: netBalance,
        last_investment_date: lastInvestmentDate,
      };
    } catch (error) {
      console.error(`Error getting investment stats for client ${clientId}:`, error);
      // Return default values if there's an error
      return {
        client_id: clientId,
        total_allocations: 0,
        total_invested: 0,
        net_balance: 0,
        last_investment_date: undefined,
      };
    }
  }

  /**
   * Get investment statistics for multiple clients
   */
  async getMultipleClientInvestmentStats(clientIds: string[]): Promise<Map<string, ClientInvestmentStats>> {
    const statsMap = new Map<string, ClientInvestmentStats>();
    
    // Process clients in parallel with limited concurrency to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < clientIds.length; i += batchSize) {
      const batch = clientIds.slice(i, i + batchSize);
      const batchPromises = batch.map(clientId => this.getClientInvestmentStats(clientId));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach(stats => {
          statsMap.set(stats.client_id, stats);
        });
      } catch (error) {
        console.error('Error processing batch:', error);
        // Add default stats for failed batch
        batch.forEach(clientId => {
          statsMap.set(clientId, {
            client_id: clientId,
            total_allocations: 0,
            total_invested: 0,
            net_balance: 0,
            last_investment_date: undefined,
          });
        });
      }
    }
    
    return statsMap;
  }

  /**
   * Get aggregated investment statistics for all clients
   */
  async getGlobalInvestmentStats() {
    try {
      // Get allocation summary
      const allocationSummary = await allocationService.getAllocationSummary();
      
      // Get global movement summary
      const movementSummary = await movementService.getMovementSummary();
      
      return {
        totalInvestments: allocationSummary.total_allocations,
        totalInvestedAmount: movementSummary.totalDeposits, // Use total deposits instead of allocation values
        uniqueClients: allocationSummary.unique_clients,
        uniqueAssets: allocationSummary.unique_assets,
        averagePortfolioValue: allocationSummary.unique_clients > 0 
          ? movementSummary.totalDeposits / allocationSummary.unique_clients 
          : 0,
      };
    } catch (error) {
      console.error('Error getting global investment stats:', error);
      return {
        totalInvestments: 0,
        totalInvestedAmount: 0,
        uniqueClients: 0,
        uniqueAssets: 0,
        averagePortfolioValue: 0,
      };
    }
  }
}

export const clientInvestmentService = new ClientInvestmentService();