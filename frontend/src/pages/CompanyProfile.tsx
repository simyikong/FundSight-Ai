import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Paper
} from '@mui/material';
import Layout from '../components/Layout';
import { 
  CompanyProfileSection, 
  DocumentUploadSection,
  CompanyProfile as CompanyProfileType,
  UploadedDocument
} from '../components/CompanyProfile';

const CompanyProfile: React.FC = () => {
  // Company profile state
  const [profile, setProfile] = useState<CompanyProfileType>({
    companyName: '',
    registrationNumber: '',
    companyType: '',
    industry: '',
    location: '',
    yearsOfOperation: '',
    employees: '',
    revenue: '',
    netProfit: '',
    taxStatus: '',
    description: ''
  });

  // Document upload state
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // Handle document upload
  const handleDocumentUpload = (type: string, file: File) => {
    const newDocument: UploadedDocument = {
      id: Date.now().toString(),
      type,
      file,
      fileName: file.name,
      uploadDate: new Date(),
      status: 'uploaded',
      isActive: true, // Make new uploads active by default
    };
    
    // If this is a new active document, deactivate other documents of the same type
    const updatedDocuments = documents.map(doc => {
      if (doc.type === type && doc.isActive) {
        return { ...doc, isActive: false };
      }
      return doc;
    });
    
    setDocuments([...updatedDocuments, newDocument]);
    
    // Simulate document processing and data extraction
    setTimeout(() => {
      processDocument(newDocument.id);
    }, 1500);
  };

  // Process uploaded document (simulate OCR and data extraction)
  const processDocument = (documentId: string) => {
    setDocuments(prevDocuments => 
      prevDocuments.map(doc => {
        if (doc.id === documentId) {
          return { ...doc, status: 'processing' };
        }
        return doc;
      })
    );

    // Simulate API call to process document
    setTimeout(() => {
      setDocuments(prevDocuments => 
        prevDocuments.map(doc => {
          if (doc.id === documentId) {
            // Simulate extracted data based on document type
            let extractedData = {};
            
            if (doc.type === 'ssmCertificate') {
              extractedData = {
                companyName: 'Ali Maju Cafe Enterprise',
                registrationNumber: '0023456789-A',
                companyType: 'Sole Proprietorship',
                industry: 'Food & Beverage'
              };
            }
            
            // Only update profile fields if they're empty or if this is an active document
            if (doc.isActive) {
              setProfile(prev => ({
                ...prev,
                ...extractedData
              }));
            }
            
            return { 
              ...doc, 
              status: 'completed',
              extractedData
            };
          }
          return doc;
        })
      );
    }, 2000);
  };

  // Update profile field
  const handleProfileChange = (field: keyof CompanyProfileType, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  // Set a document as active
  const handleSetActiveDocument = (documentId: string) => {
    const targetDoc = documents.find(doc => doc.id === documentId);
    if (!targetDoc) return;
    
    setDocuments(prevDocs => 
      prevDocs.map(doc => {
        // Deactivate all documents of the same type
        if (doc.type === targetDoc.type) {
          return { ...doc, isActive: doc.id === documentId };
        }
        return doc;
      })
    );
    
    // If the activated document has extracted data, update the profile
    if (targetDoc.extractedData) {
      setProfile(prev => ({
        ...prev,
        ...targetDoc.extractedData
      }));
    }
  };
  
  // Delete a document
  const handleDeleteDocument = (documentId: string) => {
    const targetDoc = documents.find(doc => doc.id === documentId);
    if (!targetDoc) return;
    
    // If deleting an active document, activate the most recent one of the same type
    if (targetDoc.isActive) {
      const sameTypeDocuments = documents
        .filter(doc => doc.type === targetDoc.type && doc.id !== documentId)
        .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
      
      if (sameTypeDocuments.length > 0) {
        const newActiveDoc = sameTypeDocuments[0];
        handleSetActiveDocument(newActiveDoc.id);
      }
    }
    
    // Remove the document
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
  };

  return (
    <Layout
      title="Company Profile"
      subtitle="Complete your company profile and upload the necessary documents"
    >
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>Company Information</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <CompanyProfileSection 
          profile={profile}
          onProfileChange={handleProfileChange}
        />
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Company Documents</Typography>
          <DocumentUploadSection 
            documents={documents}
            onDocumentUpload={handleDocumentUpload}
            onSetActiveDocument={handleSetActiveDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        </Box>
      </Paper>
    </Layout>
  );
};

export default CompanyProfile; 