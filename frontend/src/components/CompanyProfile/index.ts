export { default as CompanyProfileSection } from './CompanyProfileSection';
export { default as DocumentUploadSection } from './DocumentUploadSection';

// Export shared types
export * from '../../components/types';

// Explicitly export the CompanyProfile type to fix import issues
export type { CompanyProfile } from '../../components/types';