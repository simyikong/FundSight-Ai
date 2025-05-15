import React, { useState, useCallback } from 'react';
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
  Add as AddIcon
} from '@mui/icons-material';

// Months for selection
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Years for selection
const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i);

interface DocumentTag {
  month: string;
  year: number;
}

interface ProcessedDocument {
  id: string;
  file: File;
  fileName: string;
  uploadDate: Date;
  tags: DocumentTag[];
  processingStatus: 'uploading' | 'analyzing' | 'complete' | 'error';
  extractionStatus?: 'pending' | 'complete' | 'error';
  aiConfidence?: number; // 0-100
  addedToRecords?: boolean; // Track if document has been added to monthly records
}

const BulkUploadSection: React.FC = () => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [editingDocument, setEditingDocument] = useState<ProcessedDocument | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocs = acceptedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      file,
      fileName: file.name,
      uploadDate: new Date(),
      tags: [],
      processingStatus: 'uploading' as const,
      addedToRecords: false,
    }));

    setDocuments(prev => [...prev, ...newDocs]);

    // Process each document (simulated API calls)
    newDocs.forEach(doc => {
      // Simulate upload delay
      setTimeout(() => {
        setDocuments(current => 
          current.map(d => 
            d.id === doc.id ? { ...d, processingStatus: 'analyzing' } : d
          )
        );

        // Simulate AI tagging delay
        setTimeout(() => {
          // Simulate AI detected tags (in real app, would come from API)
          const aiDetectedTags = generateAITags();
          
          setDocuments(current => 
            current.map(d => 
              d.id === doc.id ? { 
                ...d, 
                processingStatus: 'complete',
                tags: aiDetectedTags,
                aiConfidence: Math.floor(Math.random() * 30) + 70 // Random 70-100
              } : d
            )
          );
        }, 3000); 
      }, 1500);
    });
  }, []);

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

  // Generate random AI tags for demo
  const generateAITags = (): DocumentTag[] => {
    const startMonth = Math.floor(Math.random() * 10); // 0-9
    const numMonths = Math.floor(Math.random() * 3) + 1; // 1-3 months
    const year = new Date().getFullYear(); // Current year
    
    return Array.from({ length: numMonths }, (_, i) => ({
      month: MONTHS[(startMonth + i) % 12],
      year: year
    }));
  };

  // Open edit tags dialog
  const handleEditTags = (doc: ProcessedDocument) => {
    setEditingDocument({...doc});
    setIsDialogOpen(true);
  };

  // Save edited tags
  const handleSaveTags = () => {
    if (editingDocument) {
      setDocuments(current => 
        current.map(d => 
          d.id === editingDocument.id ? editingDocument : d
        )
      );
    }
    setIsDialogOpen(false);
    setEditingDocument(null);
  };

  // Toggle a month/year tag
  const toggleTag = (month: string, year: number) => {
    if (!editingDocument) return;

    const existingTagIndex = editingDocument.tags.findIndex(
      tag => tag.month === month && tag.year === year
    );

    if (existingTagIndex >= 0) {
      // Remove tag
      const newTags = [...editingDocument.tags];
      newTags.splice(existingTagIndex, 1);
      setEditingDocument({...editingDocument, tags: newTags});
    } else {
      // Add tag
      setEditingDocument({
        ...editingDocument, 
        tags: [...editingDocument.tags, { month, year }]
      });
    }
  };

  // Check if a month/year is selected
  const isTagSelected = (month: string, year: number) => {
    return editingDocument?.tags.some(
      tag => tag.month === month && tag.year === year
    ) || false;
  };

  // Add document to monthly records
  const handleAddToRecords = (docId: string) => {
    // In a real app, this would make an API call to associate the document with the monthly records
    setDocuments(current => 
      current.map(d => 
        d.id === docId ? { ...d, addedToRecords: true } : d
      )
    );
    
    // Show success message
    setSnackbarMessage("Document successfully added to monthly records!");
    setSnackbarOpen(true);
    
    // In a real app, you would also trigger a refresh of the monthly records table
  };

  // Add all processed documents to monthly records
  const handleAddAllToRecords = () => {
    const completedDocs = documents.filter(doc => 
      doc.processingStatus === 'complete' && !doc.addedToRecords
    );
    
    if (completedDocs.length === 0) {
      setSnackbarMessage("No new documents to add to records.");
      setSnackbarOpen(true);
      return;
    }
    
    // Mark all completed docs as added
    setDocuments(current => 
      current.map(d => 
        (d.processingStatus === 'complete' && !d.addedToRecords) 
          ? { ...d, addedToRecords: true } 
          : d
      )
    );
    
    // Show success message
    setSnackbarMessage(`${completedDocs.length} document(s) added to monthly records!`);
    setSnackbarOpen(true);
    
    // In a real app, you would also trigger a refresh of the monthly records table
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Count docs that can be added to records
  const readyDocsCount = documents.filter(
    doc => doc.processingStatus === 'complete' && !doc.addedToRecords
  ).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Bulk Financial Document Upload
        </Typography>
        
        {readyDocsCount > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddAllToRecords}
          >
            Add {readyDocsCount} Document{readyDocsCount > 1 ? 's' : ''} to Records
          </Button>
        )}
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Upload all your financial documents at once. Our AI will automatically detect which months each document covers.
      </Typography>
      
      {/* Dropzone */}
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
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop financial documents here'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Supported formats: PDF, Excel, CSV, JPG, PNG
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={e => e.stopPropagation()}
        >
          Browse Files
        </Button>
      </Paper>

      {/* Document List */}
      {documents.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Recently Uploaded Documents
          </Typography>
          
          <Grid container spacing={2}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    borderColor: doc.addedToRecords 
                      ? 'success.main' 
                      : (doc.processingStatus === 'complete' ? 'success.light' : 'divider')
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" noWrap title={doc.fileName}>
                      {doc.fileName}
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Uploaded: {doc.uploadDate.toLocaleDateString()}
                    </Typography>
                    
                    {/* Status indicators */}
                    {doc.processingStatus === 'uploading' && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                          Uploading...
                        </Typography>
                        <LinearProgress variant="indeterminate" />
                      </Box>
                    )}
                    
                    {doc.processingStatus === 'analyzing' && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'info.main' }} />
                          AI detecting periods covered...
                        </Typography>
                        <LinearProgress variant="indeterminate" color="secondary" />
                      </Box>
                    )}
                    
                    {doc.processingStatus === 'complete' && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                            Detected periods:
                          </Typography>
                          {doc.aiConfidence && (
                            <Tooltip title="AI confidence in the detected periods">
                              <Chip 
                                label={`${doc.aiConfidence}%`} 
                                size="small" 
                                color={doc.aiConfidence > 85 ? "success" : "warning"}
                              />
                            </Tooltip>
                          )}
                        </Box>
                        
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {doc.tags.map((tag, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              label={`${tag.month} ${tag.year}`}
                              icon={<CalendarMonthIcon />}
                              sx={{ mb: 1 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    
                    {doc.addedToRecords && (
                      <Chip 
                        color="success" 
                        size="small" 
                        icon={<CheckCircleIcon />} 
                        label="Added to monthly records" 
                        sx={{ mb: 1 }}
                      />
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Tooltip title="View Document">
                      <IconButton size="small" onClick={() => window.open(URL.createObjectURL(doc.file))}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {doc.processingStatus === 'complete' && !doc.addedToRecords && (
                      <Tooltip title="Add to Monthly Records">
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddToRecords(doc.id)}
                        >
                          Add to Records
                        </Button>
                      </Tooltip>
                    )}
                    
                    {doc.processingStatus === 'complete' && (
                      <Tooltip title="Edit Periods">
                        <IconButton size="small" onClick={() => handleEditTags(doc)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Remove Document">
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => setDocuments(docs => docs.filter(d => d.id !== doc.id))}
                      >
                        <RemoveCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Edit Tags Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md">
        <DialogTitle>
          Edit Document Periods
          <Typography variant="subtitle2" color="text.secondary">
            {editingDocument?.fileName}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" paragraph>
            Select which months and years this document covers:
          </Typography>
          
          {YEARS.map(year => (
            <Box key={year} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {year}
              </Typography>
              <Grid container spacing={1}>
                {MONTHS.map(month => (
                  <Grid item xs={4} sm={3} key={`${month}-${year}`}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={isTagSelected(month, year)}
                          onChange={() => toggleTag(month, year)}
                          size="small"
                        />
                      }
                      label={month}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTags} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
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