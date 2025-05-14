// Common interfaces for the FundingRecommendations components
import React from 'react';

export interface LoanRecommendation {
  id: number;
  name: string;
  provider: string;
  amount: string;
  interestRate: string;
  eligibilitySummary: string;
  reasons: string[];
}

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