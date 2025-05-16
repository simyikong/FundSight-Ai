import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CircularProgress,
  Chip,
  IconButton,
  Collapse,
  Tooltip,
  Badge,
  Divider,
  Alert
} from '@mui/material';
import { 
  UploadFile, 
  CheckCircle, 
  Error, 
  Description, 
  ExpandMore, 
  ExpandLess, 
  WarningAmber,
  Delete,
  Visibility,
  CheckCircleOutline,
  Info
} from '@mui/icons-material';
import { 
  UploadedDocument, 
  DocumentType, 
  formatDate, 
  isDocumentOutdated 
} from '../../components/types';

interface DocumentUploadSectionProps {
  documents: UploadedDocument[];
  onDocumentUpload: (type: string, file: File) => void;
  onSetActiveDocument?: (documentId: string) => void;
  onDeleteDocument?: (documentId: string) => void;
}

const documentTypes: DocumentType[] = [
  {
    id: 'ssmCertificate',
    name: 'SSM Certificate',
    description: 'Business registration document',
    icon: <Description />,
    expiryPeriod: 365, // Annual
    required: true
  },
  {
    id: 'businessLicense',
    name: 'Business License',
    description: 'Operating license for your business',
    icon: <Description />,
    expiryPeriod: 365, // Annual
    required: false
  },
  {
    id: 'taxRegistration',
    name: 'Tax Registration',
    description: 'Tax registration certificate',
    icon: <Description />,
    expiryPeriod: 730, // 2 years
    required: false
  },
  {
    id: 'companyConstitution',
    name: 'Company Constitution',
    description: 'Company constitution or partnership agreement',
    icon: <Description />,
    expiryPeriod: 1825, // 5 years
    required: false
  }
];

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  documents,
  onDocumentUpload,
  onSetActiveDocument = () => {},
  onDeleteDocument = () => {}
}) => {
  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (file) {
      onDocumentUpload(documentType, file);
    }
  };

  const triggerFileInput = (documentTypeId: string) => {
    fileInputRefs.current[documentTypeId]?.click();
  };

  const toggleExpand = (documentTypeId: string) => {
    setExpandedTypes(prev => ({
      ...prev,
      [documentTypeId]: !prev[documentTypeId]
    }));
  };

  const getDocumentsByType = (typeId: string) => {
    return documents.filter(doc => doc.type === typeId).sort((a, b) => {
      // Sort by uploadDate (newest first)
      return b.uploadDate.getTime() - a.uploadDate.getTime();
    });
  };

  const getActiveDocument = (typeId: string) => {
    return documents.find(doc => doc.type === typeId && doc.isActive);
  };

  const getLatestDocument = (typeId: string) => {
    const typeDocs = getDocumentsByType(typeId);
    return typeDocs.length > 0 ? typeDocs[0] : null;
  };

  const getStatusIcon = (status: string | null, isOutdated: boolean) => {
    if (status === 'uploaded') return <UploadFile color="info" />;
    if (status === 'processing') return <CircularProgress size={20} />;
    if (status === 'completed' && isOutdated) return <WarningAmber color="warning" />;
    if (status === 'completed') return <CheckCircle color="success" />;
    if (status === 'error') return <Error color="error" />;
    return null;
  };

  // Check if the required documents are present
  const hasRequiredDocuments = () => {
    const requiredDocTypes = documentTypes.filter(dt => dt.required);
    return requiredDocTypes.every(dt => 
      documents.some(doc => doc.type === dt.id && doc.status === 'completed')
    );
  };

  return (
    <Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload your business registration and compliance documents. We'll extract company information to enhance your profile.
      </Typography>

      {!hasRequiredDocuments() && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please upload the required documents (marked with *) to complete your profile and get funding recommendations.
        </Alert>
      )}

      <List>
        {documentTypes.map((docType) => {
          const typeDocs = getDocumentsByType(docType.id);
          const activeDoc = getActiveDocument(docType.id);
          const latestDoc = getLatestDocument(docType.id);
          const hasDocuments = typeDocs.length > 0;
          const isExpanded = expandedTypes[docType.id] || false;
          
          const isOutdated = activeDoc 
            ? isDocumentOutdated(activeDoc.uploadDate, docType.expiryPeriod) 
            : false;
            
          return (
            <Paper
              key={docType.id}
              variant="outlined"
              sx={{
                mb: 2,
                borderRadius: 1,
                borderColor: isOutdated ? 'warning.main' : (docType.required && !activeDoc ? 'error.light' : 'divider'),
                overflow: 'hidden'
              }}
            >
              {/* Document type header with active document */}
              <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <Badge 
                      color={hasDocuments ? (isOutdated ? "warning" : "success") : "default"} 
                      variant="dot"
                      overlap="circular"
                    >
                      {docType.icon}
                    </Badge>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="subtitle1">
                      {docType.name} {docType.required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                    {!activeDoc && (
                      <Typography variant="body2" color="text.secondary">
                        {docType.description}
                      </Typography>
                    )}
                    {activeDoc && (
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          size="small" 
                          label="Active" 
                          color={isOutdated ? "warning" : "success"} 
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Uploaded: {formatDate(activeDoc.uploadDate)}
                        </Typography>
                        {isOutdated && (
                          <Chip 
                            size="small" 
                            color="warning" 
                            icon={<WarningAmber fontSize="small" />}
                            label="Outdated" 
                          />
                        )}
                      </Box>
                    )}
                  </Grid>
                  <Grid item>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {activeDoc ? (
                        <>
                          <Tooltip title="View document">
                            <IconButton size="small" onClick={() => window.open(URL.createObjectURL(activeDoc.file))}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Upload new version">
                            <IconButton size="small" onClick={() => triggerFileInput(docType.id)}>
                              <UploadFile fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => triggerFileInput(docType.id)}
                          startIcon={<UploadFile />}
                        >
                          Upload
                        </Button>
                      )}
                      {hasDocuments && (
                        <IconButton size="small" onClick={() => toggleExpand(docType.id)}>
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
              
              {/* Document history */}
              {hasDocuments && (
                <Collapse in={isExpanded}>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Document History
                    </Typography>
                    <List dense disablePadding>
                      {typeDocs.map((doc) => (
                        <ListItem
                          key={doc.id}
                          secondaryAction={
                            <Box sx={{ display: 'flex' }}>
                              {!doc.isActive && (
                                <Tooltip title="Set as active">
                                  <IconButton edge="end" size="small" onClick={() => onSetActiveDocument(doc.id)}>
                                    <CheckCircleOutline fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete">
                                <IconButton edge="end" size="small" onClick={() => onDeleteDocument(doc.id)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          }
                          disablePadding
                          sx={{ py: 0.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            {getStatusIcon(doc.status, isDocumentOutdated(doc.uploadDate, docType.expiryPeriod))}
                          </ListItemIcon>
                          <ListItemText
                            primary={doc.fileName}
                            secondary={formatDate(doc.uploadDate)}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              )}
              
              {/* File input (hidden) */}
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={(e) => handleFileUpload(e, docType.id)}
                ref={(element) => {
                  fileInputRefs.current[docType.id] = element;
                }}
              />
            </Paper>
          );
        })}
      </List>
    </Box>
  );
};

export default DocumentUploadSection; 