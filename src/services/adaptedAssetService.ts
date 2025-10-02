import { apiClient } from '../lib/api';
import type { Asset } from '../types/investment';

export interface AssetService {
  getAssets: () => Promise<Asset[]>;
  getAsset: (id: string) => Promise<Asset>;
  createAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdate'>) => Promise<Asset>;
  updateAsset: (id: string, asset: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdate'>>) => Promise<Asset>;
  deleteAsset: (id: string) => Promise<void>;
  searchYahooAsset: (symbol: string) => Promise<any>;
  createAssetFromYahoo: (symbol: string) => Promise<Asset>;
}

class RealAssetService implements AssetService {
  async getAssets(): Promise<Asset[]> {
    const backendAssets = await apiClient.get<any[]>('/assets');
    
    // Convert backend format to frontend format
    return backendAssets.map(ba => ({
      id: ba.id.toString(),
      symbol: ba.ticker,
      name: ba.name,
      type: 'stocks' as const,
      sector: 'Unknown',
      currency: ba.currency || 'USD',
      currentPrice: 0,
      marketCap: 0,
      dividendYield: undefined,
      lastUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  async getAsset(id: string): Promise<Asset> {
    const backendAsset = await apiClient.get<any>(`/assets/${id}`);
    
    return {
      id: backendAsset.id.toString(),
      symbol: backendAsset.ticker,
      name: backendAsset.name,
      type: 'stocks' as const,
      sector: 'Unknown',
      currency: backendAsset.currency || 'USD',
      currentPrice: 0,
      marketCap: 0,
      dividendYield: undefined,
      lastUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdate'>): Promise<Asset> {
    // Convert frontend format to backend format
    const backendData = {
      ticker: asset.symbol,
      name: asset.name,
      exchange: 'Unknown',
      currency: asset.currency,
    };

    const backendAsset = await apiClient.post<any>('/assets', backendData);
    
    return {
      id: backendAsset.id.toString(),
      symbol: backendAsset.ticker,
      name: backendAsset.name,
      type: 'stocks' as const,
      sector: 'Unknown',
      currency: backendAsset.currency || 'USD',
      currentPrice: 0,
      marketCap: 0,
      dividendYield: undefined,
      lastUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateAsset(id: string, asset: Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'lastUpdate'>>): Promise<Asset> {
    // Convert frontend format to backend format
    const backendData: any = {};
    
    if (asset.symbol !== undefined) backendData.ticker = asset.symbol;
    if (asset.name !== undefined) backendData.name = asset.name;
    if (asset.currency !== undefined) backendData.currency = asset.currency;

    const backendAsset = await apiClient.put<any>(`/assets/${id}`, backendData);
    
    return {
      id: backendAsset.id.toString(),
      symbol: backendAsset.ticker,
      name: backendAsset.name,
      type: 'stocks' as const,
      sector: 'Unknown',
      currency: backendAsset.currency || 'USD',
      currentPrice: 0,
      marketCap: 0,
      dividendYield: undefined,
      lastUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async deleteAsset(id: string): Promise<void> {
    return apiClient.delete<void>(`/assets/${id}`);
  }

  async searchYahooAsset(symbol: string): Promise<any> {
    return apiClient.get<any>(`/assets/search-yahoo/${symbol}`);
  }

  async createAssetFromYahoo(symbol: string): Promise<Asset> {
    const backendAsset = await apiClient.post<any>(`/assets/from-yahoo/${symbol}`);
    
    return {
      id: backendAsset.id.toString(),
      symbol: backendAsset.ticker,
      name: backendAsset.name,
      type: 'stocks' as const,
      sector: 'Unknown',
      currency: backendAsset.currency || 'USD',
      currentPrice: 0,
      marketCap: 0,
      dividendYield: undefined,
      lastUpdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

// Export the real service
export const assetService = new RealAssetService();