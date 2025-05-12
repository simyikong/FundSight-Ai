import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton,
  Button,
  Stack,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
  Close as CloseIcon 
} from '@mui/icons-material';

const DropzoneWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  outline: 'none',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
  transition: 'border .3s ease-in-out, background-color .3s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05)
  }
}));

const AnimatedListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  animation: 'fadeIn 0.5s',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateX(20px)'
    },
    '100%': {
      opacity: 1,
      transform: 'translateX(0)'
    }
  }
}));

interface FileWithPreview extends File {
  preview: string;
}

interface MultiFileUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  acceptTypes?: string; // User-friendly description of accepted file types
  onFilesChange?: (files: FileWithPreview[]) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  },
  acceptTypes = "PDF, DOC, DOCX, XLS, XLSX",
  onFilesChange
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [fileRejections, setFileRejections] = useState<any[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (acceptedFiles?.length) {
      setFiles(prevFiles => {
        // Create a combined array with new files at the end
        const newFiles = [
          ...prevFiles,
          ...acceptedFiles.map(file => 
            Object.assign(file, {
              preview: URL.createObjectURL(file)
            })
          )
        ];
        
        // Keep only up to maxFiles
        const limitedFiles = newFiles.slice(0, maxFiles);
        
        // Call the callback with the updated files
        if (onFilesChange) {
          onFilesChange(limitedFiles);
        }
        
        return limitedFiles;
      });
    }

    if (rejectedFiles?.length) {
      setFileRejections(rejectedFiles);
    }
  }, [maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
  });

  const handleRemoveFile = (fileIndex: number) => {
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      // Release the object URL to avoid memory leaks
      URL.revokeObjectURL(updatedFiles[fileIndex].preview);
      updatedFiles.splice(fileIndex, 1);
      
      // Call the callback with the updated files
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }
      
      return updatedFiles;
    });
  };

  const handleRemoveAll = () => {
    // Release all object URLs
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    
    // Call the callback with empty array
    if (onFilesChange) {
      onFilesChange([]);
    }
  };

  // Clean up object URLs on component unmount
  React.useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, []);

  return (
    <Box>
      <DropzoneWrapper
        {...getRootProps()}
        sx={{
          borderColor: isDragReject ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
          backgroundColor: isDragActive ? (theme) => alpha(theme.palette.primary.main, 0.05) : 'background.paper'
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
        <Typography variant="h6" align="center" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary">
          or <span style={{ color: '#1976d2', cursor: 'pointer' }}>browse</span> to choose files
        </Typography>
        <Typography variant="caption" align="center" color="textSecondary" sx={{ mt: 1 }}>
          {acceptTypes} up to {formatFileSize(maxSize)}
        </Typography>
        <Typography variant="caption" align="center" color="textSecondary">
          (Maximum {maxFiles} files)
        </Typography>
      </DropzoneWrapper>

      {/* Rejected files */}
      {fileRejections.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Rejected Files:
          </Typography>
          <Paper variant="outlined" sx={{ p: 1, bgcolor: (theme) => alpha(theme.palette.error.main, 0.05) }}>
            <List dense disablePadding>
              {fileRejections.map(({ file, errors }, index) => (
                <AnimatedListItem key={index}>
                  <ListItemIcon>
                    <FileIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={errors.map((error: { message: string }) => error.message).join(', ')}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption', color: 'error' }}
                  />
                </AnimatedListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* Accepted files */}
      {files.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Files:
          </Typography>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <List dense disablePadding>
              {files.map((file, index) => (
                <AnimatedListItem key={index}>
                  <ListItemIcon>
                    <FileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={formatFileSize(file.size)}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      size="small" 
                      onClick={() => handleRemoveFile(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </AnimatedListItem>
              ))}
            </List>
          </Paper>
          
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
            <Button 
              size="small" 
              onClick={handleRemoveAll}
            >
              Remove All
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default MultiFileUpload; 