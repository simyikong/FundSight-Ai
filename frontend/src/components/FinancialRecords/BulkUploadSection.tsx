import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip,
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Stack,
  Tooltip,
  Fade,
  alpha,
  Snackbar,
  Alert
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import {
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  RemoveCircle as RemoveCircleIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  Add as AddIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { documentsApi } from '../../services';

// Months for selection
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Years for selection
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i);

interface DocumentTag {
  tag: string;
  value: string;
  year?: number;
  month?: number;
}

interface ProcessedDocument {
  id: string | number;
  file?: File;
  filename: string;
  uploadDate: Date;
  tags: DocumentTag[];
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
  ai_confidence?: number | null;
  addedToRecords?: boolean;
}

interface BulkUploadSectionProps {
  onDocumentsAddedToRecords?: (documents: { id: string | number, year?: number, month?: number }[]) => void;
}

const BulkUploadSection: React.FC<BulkUploadSectionProps> = ({ onDocumentsAddedToRecords }) => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [editingDocument, setEditingDocument] = useState<ProcessedDocument | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load recent documents on component mount
  useEffect(() => {
    const fetchRecentDocuments = async () => {
      try {
        setLoading(true);
        const recentDocs = await documentsApi.getRecentDocuments();
        
        // Convert API response to our document format
        const formattedDocs: ProcessedDocument[] = recentDocs.map((doc: any) => ({
          id: doc.id,
          filename: doc.filename,
          uploadDate: new Date(doc.upload_date),
          tags: doc.tags || [],
          status: doc.status,
          ai_confidence: doc.ai_confidence,
          addedToRecords: doc.tags?.some((tag: DocumentTag) => tag.tag === 'status' && tag.value === 'added_to_records')
        }));
        
        setDocuments(formattedDocs);
      } catch (error) {
        console.error('Error fetching recent documents:', error);
        setSnackbarMessage('Failed to load recent documents');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentDocuments();
  }, []);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        // Create temporary entry with uploading status
        const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const tempDoc: ProcessedDocument = {
          id: tempId,
          file,
          filename: file.name,
          uploadDate: new Date(),
          tags: [],
          status: 'uploading',
          addedToRecords: false,
        };
        
        setDocuments(prev => [...prev, tempDoc]);
        
        // Upload file to server
        const response = await documentsApi.uploadDocument(file);
        
        // Replace temporary entry with server response
        setDocuments(current => 
          current.map(d => 
            d.id === tempId ? { 
              ...d, 
              id: response.id,
              status: response.status,
            } : d
          )
        );
        
        // Poll for document status until complete
        pollDocumentStatus(response.id);
        
      } catch (error) {
        console.error('Error uploading document:', error);
        setSnackbarMessage('Failed to upload document');
        setSnackbarOpen(true);
      }
    }
  }, []);

  // Poll document status until processing is complete
  const pollDocumentStatus = async (docId: string | number) => {
    try {
      // Initial delay before polling
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let complete = false;
      while (!complete) {
        const docData = await documentsApi.getDocument(docId);
        
        // Update document in state
        setDocuments(current => 
          current.map(d => {
            if (d.id === docId) {
              return {
                ...d,
                status: docData.status,
                tags: docData.tags || [],
                ai_confidence: docData.ai_confidence
              } as ProcessedDocument;
            }
            return d;
          })
        );
        
        if (docData.status === 'complete' || docData.status === 'error') {
          complete = true;
        } else {
          // Wait before polling again
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    } catch (error) {
      console.error('Error polling document status:', error);
    }
  };

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  });

  // Open edit tags dialog
  const handleEditTags = (doc: ProcessedDocument) => {
    setEditingDocument({...doc});
    setIsDialogOpen(true);
  };

  // Save edited tags
  const handleSaveTags = async () => {
    if (editingDocument) {
      try {
        // Extract month and year from tags
        const periodTag = editingDocument.tags.find(tag => tag.tag === 'period');
        let month: number | undefined;
        let year: number | undefined;
        
        if (periodTag) {
          month = periodTag.month;
          year = periodTag.year;
        }
        
        // Custom tags
        const customTags = editingDocument.tags
          .filter(tag => tag.tag === 'custom')
          .map(tag => tag.value);
        
        // Update tags on server
        await documentsApi.updateTags(
          editingDocument.id,
          year,
          month,
          customTags.length > 0 ? customTags : undefined
        );
        
        // Create a copy of the document with addedToRecords reset to false
        // because changing tags means we need to re-add the document to records
        const updatedDoc = {
          ...editingDocument,
          addedToRecords: false
        };
        
        // Remove any "added_to_records" tag
        updatedDoc.tags = updatedDoc.tags.filter(tag => !(tag.tag === 'status' && tag.value === 'added_to_records'));
        
        // Update document in state
        setDocuments(current => 
          current.map(d => 
            d.id === updatedDoc.id ? updatedDoc : d
          )
        );
        
        setSnackbarMessage('Document tags updated. You can now add this document to records.');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error updating tags:', error);
        setSnackbarMessage('Failed to update tags');
        setSnackbarOpen(true);
      }
    }
    setIsDialogOpen(false);
    setEditingDocument(null);
  };

  // Toggle a month/year tag
  const toggleTag = (month: string, year: number) => {
    if (!editingDocument) return;
    
    // Get month as number (1-12)
    const monthIndex = MONTHS.indexOf(month) + 1;
    
    // Check if this period tag already exists
    const existingTagIndex = editingDocument.tags.findIndex(
      tag => tag.tag === 'period' && tag.month === monthIndex && tag.year === year
    );
    
    if (existingTagIndex >= 0) {
      // Remove the tag if it exists (toggle off)
      const updatedTags = [...editingDocument.tags];
      updatedTags.splice(existingTagIndex, 1);
      setEditingDocument({...editingDocument, tags: updatedTags});
    } else {
      // Add a new period tag (toggle on)
      setEditingDocument({
        ...editingDocument, 
        tags: [
          ...editingDocument.tags, 
          { 
            tag: 'period', 
            value: `${monthIndex}/${year}`,
            month: monthIndex,
            year: year
          }
        ]
      });
    }
  };

  // Check if a month/year is selected
  const isTagSelected = (month: string, year: number) => {
    if (!editingDocument) return false;
    
    const monthIndex = MONTHS.indexOf(month) + 1;
    return editingDocument.tags.some(
      tag => tag.tag === 'period' && tag.month === monthIndex && tag.year === year
    );
  };

  // Helper to get year and month from document tags
  const getDocumentPeriod = (doc: ProcessedDocument) => {
    const periodTag = doc.tags.find(tag => tag.tag === 'period');
    return {
      id: doc.id,
      year: periodTag?.year,
      month: periodTag?.month
    };
  };

  // Add document to monthly records
  const handleAddToRecords = async (docId: string | number) => {
    try {
      await documentsApi.addToRecords(docId);
      
      // Update document in state
      setDocuments(current => 
        current.map(d => 
          d.id === docId ? { 
            ...d, 
            addedToRecords: true,
            tags: [
              ...d.tags,
              { tag: 'status', value: 'added_to_records' }
            ]
          } : d
        )
      );
      
      // Find the document that was just added
      const doc = documents.find(d => d.id === docId);
      if (doc && onDocumentsAddedToRecords) {
        onDocumentsAddedToRecords([getDocumentPeriod(doc)]);
      }
      
      setSnackbarMessage('Document successfully added to monthly records!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding document to records:', error);
      setSnackbarMessage('Failed to add document to records');
      setSnackbarOpen(true);
    }
  };

  // Handle batch add to records
  const handleAddAllToRecords = async () => {
    const unaddedDocs = documents.filter(
      doc => doc.status === 'complete' && !doc.addedToRecords
    );
    
    if (unaddedDocs.length === 0) {
      setSnackbarMessage('No documents ready to be added');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      // Process each document sequentially
      for (const doc of unaddedDocs) {
        await documentsApi.addToRecords(doc.id);
      }
      
      // Update all documents in state
      setDocuments(current => 
        current.map(d => {
          if (unaddedDocs.some(doc => doc.id === d.id)) {
            return { 
              ...d, 
              addedToRecords: true,
              tags: [
                ...d.tags,
                { tag: 'status', value: 'added_to_records' }
              ]
            };
          }
          return d;
        })
      );
      
      // Notify parent component
      if (onDocumentsAddedToRecords) {
        const addedDocs = unaddedDocs.map(doc => getDocumentPeriod(doc));
        onDocumentsAddedToRecords(addedDocs);
      }
      
      setSnackbarMessage(`${unaddedDocs.length} documents added to monthly records!`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding documents to records:', error);
      setSnackbarMessage('Failed to add some documents to records');
      setSnackbarOpen(true);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (docId: string | number) => {
    try {
      // Call the API to delete the document
      await documentsApi.deleteDocument(docId);
      
      // Remove the document from state
      setDocuments(current => current.filter(d => d.id !== docId));
      
      setSnackbarMessage('Document deleted successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting document:', error);
      setSnackbarMessage('Failed to delete document');
      setSnackbarOpen(true);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Bulk Document Upload
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload your financial documents for AI-powered period detection and automatic tagging.
      </Typography>

      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          mb: 4,
          textAlign: 'center',
          backgroundColor: isDragActive ? alpha('#8EC5FC', 0.1) : 'background.paper',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: alpha('#8EC5FC', 0.05),
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop Files Here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse your files
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          Supported formats: PDF, Excel, CSV, Images
        </Typography>
      </Paper>

      {/* Document processing area */}
      {documents.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Document Processing ({documents.length})
            </Typography>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddAllToRecords}
              disabled={!documents.some(doc => doc.status === 'complete' && !doc.addedToRecords)}
            >
              Add All to Records
            </Button>
          </Box>

          <Grid container spacing={2}>
            {documents.map(doc => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  },
                  borderColor: doc.addedToRecords 
                    ? 'success.main' 
                    : (doc.status === 'complete' ? 'success.light' : 'divider')
                }}>
                  <CardContent>
                    <Typography variant="subtitle1" noWrap title={doc.filename}>
                      {doc.filename}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Uploaded: {new Date(doc.uploadDate).toLocaleString()}
                    </Typography>

                    {/* Processing status indicators */}
                    {doc.status === 'uploading' && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                          Uploading...
                        </Typography>
                        <LinearProgress variant="indeterminate" />
                      </Box>
                    )}

                    {doc.status === 'analyzing' && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'warning.main' }} />
                          AI Analysis in Progress...
                        </Typography>
                        <LinearProgress variant="indeterminate" color="warning" />
                      </Box>
                    )}

                    {doc.status === 'complete' && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                          Processing Complete
                          {doc.ai_confidence && (
                            <Chip 
                              label={`${doc.ai_confidence}% Confidence`} 
                              size="small" 
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        
                        {/* Display period tags */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                          {doc.tags
                            .filter(tag => tag.tag === 'period')
                            .map((tag, index) => (
                              <Chip
                                key={index}
                                icon={<CalendarMonthIcon fontSize="small" />}
                                label={tag.value}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                            
                          {/* Display type tags */}
                          {doc.tags
                            .filter(tag => tag.tag === 'type')
                            .map((tag, index) => (
                              <Chip
                                key={`type-${index}`}
                                label={tag.value}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ))}
                        </Stack>
                      </Box>
                    )}

                    {doc.status === 'error' && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                          <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Processing Error
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Tags">
                        <span>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditTags(doc)}
                            disabled={doc.status !== 'complete'}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <Tooltip title="Delete Document">
                        <span>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <RemoveCircleIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                    
                    <Button
                      size="small"
                      variant={doc.addedToRecords ? "outlined" : "contained"}
                      color={doc.addedToRecords ? "success" : "primary"}
                      onClick={() => handleAddToRecords(doc.id)}
                      disabled={doc.status !== 'complete' || doc.addedToRecords}
                      startIcon={doc.addedToRecords ? <CheckCircleIcon /> : <AddIcon />}
                    >
                      {doc.addedToRecords ? 'Added to Records' : 'Add to Records'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Edit tags dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md">
        <DialogTitle>Edit Document Tags</DialogTitle>
        <DialogContent dividers>
          {editingDocument && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                {editingDocument.filename}
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Select Period (Month & Year)
              </Typography>
              
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {YEARS.map(year => (
                  <React.Fragment key={year}>
                    <Grid item xs={12}>
                      <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>
                        {year}
                      </Typography>
                    </Grid>
                    {MONTHS.map(month => (
                      <Grid item key={`${month}-${year}`}>
                        <Chip
                          label={month}
                          onClick={() => toggleTag(month, year)}
                          color={isTagSelected(month, year) ? "primary" : "default"}
                          variant={isTagSelected(month, year) ? "filled" : "outlined"}
                        />
                      </Grid>
                    ))}
                  </React.Fragment>
                ))}
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTags} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Notification snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BulkUploadSection; 