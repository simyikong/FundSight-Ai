import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Document types
export interface DocumentTag {
  tag: string;
  value: string;
  year?: number;
  month?: number;
}

export interface DocumentResponse {
  id: number;
  filename: string;
  upload_date: string;
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
  ai_confidence: number | null;
  tags: DocumentTag[];
}

export interface MetricsResponse {
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  cash_flow: number;
  analysis_notes?: string;
  document_count?: number;
}

export interface YearlyTableResponse {
  year: number;
  months: Record<string, {
    hasData: boolean;
    documents: {
      id: number;
      filename: string;
    }[];
    metrics: {
      revenue: number;
      expenses: number;
      profit: number;
      cashFlow: number;
    };
    lastAnalysisDate: string | null;
  }>;
}

// Dashboard types
export interface Metric {
  title: string;
  value: number;
  change: number;
  color: string;
  tooltip: string;
}

export interface ChartData {
  historical: {
    dates: string[];
    revenue: number[];
    profit: number[];
    cash_inflow: number[];
    cash_outflow: number[];
  };
  forecast: {
    dates: string[];
    revenue: number[];
    profit: number[];
    cash_inflow: number[];
    cash_outflow: number[];
  };
}

export interface BudgetCategory {
  name: string;
  spent: number;
  budget: number;
}

export interface BudgetSuggestion {
  id: string;
  suggested: number;
}

// Document API
export const documentsApi = {
  // Upload document
  uploadDocument: async (file: File): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<DocumentResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Get recent documents
  getRecentDocuments: async (): Promise<DocumentResponse[]> => {
    const response = await api.get<DocumentResponse[]>('/documents/recent');
    return response.data;
  },
  
  // Get document by ID
  getDocument: async (id: string | number): Promise<DocumentResponse> => {
    const response = await api.get<DocumentResponse>(`/documents/${id}`);
    return response.data;
  },
  
  // Analyze document period
  analyzeDocumentPeriod: async (id: string | number): Promise<any> => {
    const response = await api.post(`/documents/${id}/analyze-period`);
    return response.data;
  },
  
  // Add document to records
  addToRecords: async (id: string | number): Promise<any> => {
    const response = await api.post(`/documents/${id}/add-to-records`);
    return response.data;
  },
  
  // Delete document
  deleteDocument: async (id: string | number): Promise<any> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
  
  // Update document tags
  updateTags: async (id: string | number, year?: number, month?: number, customTags?: string[]): Promise<any> => {
    const payload: any = {};
    if (year !== undefined) payload.year = year;
    if (month !== undefined) payload.month = month;
    if (customTags) payload.custom_tags = customTags;
    
    const response = await api.post(`/documents/${id}/update-tags`, payload);
    return response.data;
  }
};

// Metrics API
export const metricsApi = {
  // Analyze financial metrics for a month
  analyzeFinancialMetrics: async (year: number, month: number, documentIds?: number[]): Promise<MetricsResponse> => {
    const response = await api.post<MetricsResponse>(`/metrics/analyze/${year}/${month}`, documentIds);
    return response.data;
  },
  
  // Get metrics for a specific month
  getMonthMetrics: async (year: number, month: number): Promise<MetricsResponse> => {
    const response = await api.get<MetricsResponse>(`/metrics/${year}/${month}`);
    return response.data;
  },
  
  // Get yearly table data
  getYearlyTable: async (year: number): Promise<YearlyTableResponse> => {
    const response = await api.get<YearlyTableResponse>(`/metrics/table/${year}`);
    return response.data;
  },
  
  // Force analyze for a specific month (uses admin endpoint)
  forceAnalyze: async (year: number, month: number, documentIds?: number[]): Promise<any> => {
    const response = await api.post(`/admin/force-analyze/${year}/${month}`, documentIds);
    return response.data;
  }
};

// Dashboard API
export const dashboardApi = {
  // Get key financial metrics
  getMetrics: async (): Promise<Metric[]> => {
    const response = await api.get<Metric[]>('/dashboard/metrics');
    return response.data;
  },

  // Get revenue and expenses data with forecasting
  getChartData: async (): Promise<ChartData> => {
    const response = await api.get<ChartData>('/dashboard/chart-data');
    return response.data;
  },

  // Get budget categories
  getBudgetCategories: async (): Promise<BudgetCategory[]> => {
    const response = await api.get<BudgetCategory[]>('/dashboard/budget-categories');
    return response.data;
  },

  // Get budget suggestions
  getBudgetSuggestions: async (goal: number, categories: { id: string; name: string }[]): Promise<BudgetSuggestion[]> => {
    const response = await api.post<BudgetSuggestion[]>('/dashboard/budget-suggestions', {
      goal,
      categories
    });
    return response.data;
  },

  // Generate executive summary
  generateExecutiveSummary: async (startDate: string, endDate: string): Promise<Blob> => {
    const response = await api.post('/dashboard/report/executive-summary', {
      start_date: startDate,
      end_date: endDate
    }, {
      responseType: 'blob'
    });
    return response.data;
  },

  getHealthScore: async () => {
  const response = await axios.get('http://localhost:8000/api/v1/dashboard/health-score');
  return response.data;
}
  
};

// Add dashboard API methods to the default export
Object.assign(api, dashboardApi);

export default api; 