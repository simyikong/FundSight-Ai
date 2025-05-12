import React, { ReactNode } from 'react';
import { Box, Typography, TextField, TextFieldProps } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface FormFieldProps extends Omit<TextFieldProps, 'label'> {
  label: string;
  helperText?: string;
  startAdornment?: ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  startAdornment,
  ...textFieldProps
}) => {
  return (
    <Box>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 600, 
          mb: 1.5, 
          color: 'text.primary' 
        }}
      >
        {label}
      </Typography>
      <TextField
        {...textFieldProps}
        fullWidth
        variant="outlined"
        size="medium"
        InputProps={{
          ...textFieldProps.InputProps,
          startAdornment: startAdornment || textFieldProps.InputProps?.startAdornment,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
            },
          },
          ...textFieldProps.sx
        }}
      />
      {helperText && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.7, color: 'text.secondary', fontSize: 16 }} />
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FormField; 