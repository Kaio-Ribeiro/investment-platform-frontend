import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any, item?: any) => string;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  columns: ExportColumn[];
  data: any[];
  includeTimestamp?: boolean;
}

/**
 * Format currency values for export
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Format date values for export
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Format datetime values for export
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleString('pt-BR');
};

/**
 * Generate filename with timestamp
 */
const generateFilename = (baseFilename: string, includeTimestamp: boolean = true): string => {
  if (!includeTimestamp) return baseFilename;
  
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:]/g, '-');
  const namePart = baseFilename.replace(/\.[^/.]+$/, ''); // Remove extension
  return `${namePart}_${timestamp}`;
};

/**
 * Prepare data for export by applying column formatters
 */
const prepareDataForExport = (data: any[], columns: ExportColumn[]): any[] => {
  return data.map(item => {
    const exportItem: any = {};
    
    columns.forEach(column => {
      const value = item[column.key];
      exportItem[column.header] = column.formatter ? column.formatter(value, item) : value;
    });
    
    return exportItem;
  });
};

/**
 * Export data to Excel format (.xlsx)
 */
export const exportToExcel = (options: ExportOptions): void => {
  try {
    const { filename, sheetName = 'Dados', columns, data, includeTimestamp = true } = options;
    
    // Prepare data with formatters
    const formattedData = prepareDataForExport(data, columns);
    
    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    
    // Set column widths
    const colWidths = columns.map(col => ({ wch: Math.max(col.header.length, 15) }));
    ws['!cols'] = colWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Generate file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Download file
    const finalFilename = generateFilename(filename, includeTimestamp) + '.xlsx';
    saveAs(blob, finalFilename);
    
    console.log(`Excel exported successfully: ${finalFilename}`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Erro ao exportar para Excel. Tente novamente.');
  }
};

/**
 * Export data to CSV format
 */
export const exportToCSV = (options: ExportOptions): void => {
  try {
    const { filename, columns, data, includeTimestamp = true } = options;
    
    // Prepare data with formatters
    const formattedData = prepareDataForExport(data, columns);
    
    // Create CSV content
    const headers = columns.map(col => col.header);
    const csvRows = [
      headers.join(','), // Header row
      ...formattedData.map(item => 
        headers.map(header => {
          const value = item[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create blob with UTF-8 BOM for proper Excel compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Download file
    const finalFilename = generateFilename(filename, includeTimestamp) + '.csv';
    saveAs(blob, finalFilename);
    
    console.log(`CSV exported successfully: ${finalFilename}`);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Erro ao exportar para CSV. Tente novamente.');
  }
};

/**
 * Export clients data with their investment statistics
 */
export const exportClientsData = (
  clients: any[], 
  investmentStats: Map<string, any>, 
  format: 'excel' | 'csv' = 'excel'
): void => {
  const columns: ExportColumn[] = [
    { key: 'name', header: 'Nome' },
    { key: 'cpf', header: 'CPF' },
    { key: 'email', header: 'Email', formatter: (value, client) => client?.contact?.email || '' },
    { key: 'phone', header: 'Telefone', formatter: (value, client) => client?.contact?.phone || '' },
    { key: 'status', header: 'Status', formatter: (status) => {
      const labels: Record<string, string> = {
        active: 'Ativo',
        inactive: 'Inativo',
        prospect: 'Prospect',
        suspended: 'Suspenso'
      };
      return labels[status] || status;
    }},
    { key: 'investmentProfile', header: 'Perfil de Investimento', formatter: (profile) => {
      const labels: Record<string, string> = {
        conservative: 'Conservador',
        moderate: 'Moderado',
        aggressive: 'Arrojado',
        not_defined: 'Não definido'
      };
      return labels[profile] || profile;
    }},
    { key: 'totalInvestments', header: 'Qtd. Investimentos', formatter: (value, client) => {
      const stats = investmentStats.get(client?.id);
      return stats?.total_allocations || 0;
    }},
    { key: 'totalInvested', header: 'Valor Investido', formatter: (value, client) => {
      const stats = investmentStats.get(client?.id);
      return formatCurrency(stats?.total_invested || 0);
    }},
    { key: 'netBalance', header: 'Patrimônio', formatter: (value, client) => {
      const stats = investmentStats.get(client?.id);
      return formatCurrency(stats?.net_balance || 0);
    }},
    { key: 'lastInvestment', header: 'Último Investimento', formatter: (value, client) => {
      const stats = investmentStats.get(client?.id);
      return stats?.last_investment_date ? formatDate(stats.last_investment_date) : '';
    }},
    { key: 'createdAt', header: 'Data de Cadastro', formatter: (date) => formatDate(date) }
  ];

  const options: ExportOptions = {
    filename: 'clientes',
    sheetName: 'Clientes',
    columns,
    data: clients
  };

  if (format === 'excel') {
    exportToExcel(options);
  } else {
    exportToCSV(options);
  }
};

/**
 * Export allocations data
 */
export const exportAllocationsData = (
  allocations: any[], 
  format: 'excel' | 'csv' = 'excel'
): void => {
  const columns: ExportColumn[] = [
    { key: 'client_name', header: 'Cliente' },
    { key: 'asset_ticker', header: 'Ticker' },
    { key: 'asset_name', header: 'Ativo' },
    { key: 'quantity', header: 'Quantidade', formatter: (value) => value?.toLocaleString('pt-BR') || '0' },
    { key: 'buy_price', header: 'Preço de Compra', formatter: (value) => formatCurrency(value) },
    { key: 'total_invested', header: 'Total Investido', formatter: (value) => formatCurrency(value) },
    { key: 'buy_date', header: 'Data de Compra', formatter: (date) => formatDate(date) }
  ];

  const options: ExportOptions = {
    filename: 'alocacoes',
    sheetName: 'Alocações',
    columns,
    data: allocations
  };

  if (format === 'excel') {
    exportToExcel(options);
  } else {
    exportToCSV(options);
  }
};

/**
 * Export movements data
 */
export const exportMovementsData = (
  movements: any[], 
  format: 'excel' | 'csv' = 'excel'
): void => {
  const columns: ExportColumn[] = [
    { key: 'clientName', header: 'Cliente' },
    { key: 'type', header: 'Tipo', formatter: (type) => {
      const labels: Record<string, string> = {
        deposit: 'Depósito',
        withdrawal: 'Saque',
        transfer_in: 'Transferência Entrada',
        transfer_out: 'Transferência Saída'
      };
      return labels[type] || type;
    }},
    { key: 'amount', header: 'Valor', formatter: (value) => formatCurrency(value) },
    { key: 'status', header: 'Status', formatter: (status) => {
      const labels: Record<string, string> = {
        pending: 'Pendente',
        processing: 'Processando',
        completed: 'Concluído',
        cancelled: 'Cancelado',
        failed: 'Falhou'
      };
      return labels[status] || status;
    }},
    { key: 'requestedDate', header: 'Data da Solicitação', formatter: (date) => formatDateTime(date) },
    { key: 'completedDate', header: 'Data de Conclusão', formatter: (date) => formatDateTime(date) },
    { key: 'description', header: 'Descrição' }
  ];

  const options: ExportOptions = {
    filename: 'movimentacoes',
    sheetName: 'Movimentações',
    columns,
    data: movements
  };

  if (format === 'excel') {
    exportToExcel(options);
  } else {
    exportToCSV(options);
  }
};