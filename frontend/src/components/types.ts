// Common interfaces for ProfileApply components
import React from 'react';

export interface CompanyProfile {
  companyName: string;
  website?: string;
  registrationNumber: string;
  companyType: string;
  industry: string;
  location: string;
  yearsOfOperation: string;
  registrationYear?: string;
  employees: string;
  founderGender?: string;
  founderEthnicity?: string;
  specialCategory?: string;
  missionStatement?: string;
  description: string;
  previousGrantsReceived?: string;
  interestedGrantTypes?: string[];
}

export interface UploadedDocument {
  id: string;
  type: string;
  file: File;
  fileName: string;
  uploadDate: Date;
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  isActive: boolean;
  periodStart?: string;
  periodEnd?: string;
  extractedData?: Record<string, any>;
  preview?: string;
}

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  expiryPeriod: number; // in days
  required: boolean;
}

export interface FinancialMetrics {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
  netProfit: number;
  cashBalance: number;
  payroll?: number;
  taxAmount?: number;
  status: 'complete' | 'partial' | 'pending';
  lastUpdated: Date;
}

export interface LoanRecommendation {
  id: number;
  name: string;
  provider: string;
  applicationUrl?: string;
  objective?: string;
  coverage?: string;
  eligibilityRequirements?: string[];
  financingAmount?: string[];
  tenure?: string;
  financingRate?: string[];
  // Keep backward compatibility for existing fields
  amount?: string;
  interestRate?: string;
  eligibilitySummary?: string;
  reasons?: string[];
}

// Constants
export const COMPANY_TYPES = [
  'Sole Proprietorship',
  'Partnership',
  'Limited Liability Partnership (LLP)',
  'Private Limited Company (Sdn Bhd)',
  'Public Limited Company (Bhd)'
];

export const INDUSTRIES = [
  'Agriculture',
  'Manufacturing',
  'Construction',
  'Food & Beverage',
  'Retail',
  'Services',
  'Technology',
  'Healthcare',
  'Education',
  'Other'
];

export const TAX_STATUSES = [
  'Regular Filing',
  'Tax Incentive Program',
  'Tax Exemption',
  'Others'
];

// Document type mapping for gallery view
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'ssmCertificate': 'SSM Certificate',
  'businessLicense': 'Business License',
  'taxRegistration': 'Tax Registration',
  'companyConstitution': 'Company Constitution',
  'plStatement': 'P&L Statement',
  'bankStatement': 'Bank Statement',
  'invoices': 'Invoices'
};

// Constants
export const LOAN_PURPOSES = [
  'Equipment',
  'Payroll',
  'Expansion',
  'Inventory',
  'Working Capital',
  'Debt Refinancing',
  'Other'
];

// Helper functions
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return "RM 0";
  return `RM ${numValue.toLocaleString()}`;
};

export const formatDate = (date: Date): string => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

export const isDocumentOutdated = (uploadDate: Date, expiryPeriod: number): boolean => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - uploadDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > expiryPeriod;
}; 