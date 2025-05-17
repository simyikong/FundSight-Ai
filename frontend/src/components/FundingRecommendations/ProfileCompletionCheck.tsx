import React from 'react';
import { Typography, Button, Alert } from '@mui/material';

interface ProfileCompletionCheckProps {
  missingFields: string[];
  onCompleteProfileClick: () => void;
}

const ProfileCompletionCheck: React.FC<ProfileCompletionCheckProps> = ({
  missingFields,
  onCompleteProfileClick
}) => {
  return (
    <div>
      <Typography variant="body1" paragraph>
        To get personalized funding recommendations, you need to complete your company profile with the following required fields:
      </Typography>
      
      {missingFields.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Missing information:</Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            {missingFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={onCompleteProfileClick}
      >
        Complete Your Profile
      </Button>
    </div>
  );
};

export default ProfileCompletionCheck; 