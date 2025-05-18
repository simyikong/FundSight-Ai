import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  LinearProgress, 
  Chip,
  Stack,
  useTheme,
  Fade
} from '@mui/material';
import { 
  Psychology, 
  Search, 
  DataObject, 
  AutoAwesome 
} from '@mui/icons-material';

// Define the thinking stages
const thinkingStages = [
  { 
    id: 'analyzing', 
    label: 'Analyzing company profile and financial data', 
    duration: 2000,
    icon: <Psychology />,
    details: [
      'Processing financial statements',
      'Analyzing cash flow patterns',
      'Evaluating industry benchmarks',
      'Checking eligibility criteria'
    ]
  },
  { 
    id: 'rag', 
    label: 'Retrieving relevant funding information', 
    duration: 2500,
    icon: <Search />,
    details: [
      'Searching funding database',
      'Matching with industry requirements',
      'Filtering by eligibility criteria',
      'Ranking funding options by relevance'
    ]
  },
  { 
    id: 'formulating', 
    label: 'Formulating personalized recommendations', 
    duration: 3000,
    icon: <DataObject />,
    details: [
      'Generating recommendation structure',
      'Calculating funding match score',
      'Determining reason for recommendation',
      'Finalizing eligibility assessment'
    ]
  },
  { 
    id: 'finalizing', 
    label: 'Preparing your funding options', 
    duration: 1500,
    icon: <AutoAwesome />,
    details: [
      'Creating visual presentation',
      'Formatting provider details',
      'Sorting by suitability score',
      'Finalizing recommendations'
    ]
  }
];

interface ThinkingProcessProps {
  isVisible: boolean;
}

const ThinkingProcess: React.FC<ThinkingProcessProps> = ({ isVisible }) => {
  const theme = useTheme();
  const [currentStage, setCurrentStage] = useState(0);
  const [detailIndex, setDetailIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Reset when visibility changes
  useEffect(() => {
    if (isVisible) {
      setCurrentStage(0);
      setProgress(0);
      setDetailIndex(0);
    }
  }, [isVisible]);

  // Simulate the thinking process by advancing through stages
  useEffect(() => {
    if (!isVisible) return;

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 100);

    // Stage transition
    let timeout: NodeJS.Timeout;
    if (currentStage < thinkingStages.length) {
      const stage = thinkingStages[currentStage];
      timeout = setTimeout(() => {
        if (currentStage < thinkingStages.length - 1) {
          setCurrentStage(currentStage + 1);
          setDetailIndex(0);
        }
      }, stage.duration);
    }

    // Detail rotation within a stage
    const detailInterval = setInterval(() => {
      const stage = thinkingStages[currentStage];
      if (stage && stage.details) {
        setDetailIndex((prev) => (prev + 1) % stage.details.length);
      }
    }, 800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      clearInterval(detailInterval);
    };
  }, [currentStage, isVisible]);

  if (!isVisible) return null;

  const currentStageData = thinkingStages[currentStage];

  return (
    <Fade in={isVisible} timeout={800}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          my: 3,
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 4, 
              borderRadius: 0,
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
              }
            }} 
          />
        </Box>

        <Typography variant="h6" gutterBottom sx={{ pt: 1, display: 'flex', alignItems: 'center' }}>
          <Psychology sx={{ mr: 1, color: theme.palette.primary.main }} />
          AI Agent is Thinking...
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Give us a moment while our AI analyzes your requirements and generates personalized funding recommendations
        </Typography>

        <Stack spacing={2}>
          {thinkingStages.map((stage, index) => (
            <Box 
              key={stage.id} 
              sx={{ 
                opacity: index <= currentStage ? 1 : 0.4,
                transform: index === currentStage ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease',
                p: 2,
                borderRadius: 1,
                backgroundColor: index === currentStage ? 
                  `${theme.palette.primary.main}10` : 'transparent',
                border: index === currentStage ? 
                  `1px solid ${theme.palette.primary.main}40` : '1px solid transparent'
              }}
            >
              <Box display="flex" alignItems="center">
                <Box 
                  sx={{ 
                    mr: 2, 
                    color: index <= currentStage ? 
                      theme.palette.primary.main : theme.palette.text.disabled,
                    display: 'flex'
                  }}
                >
                  {stage.icon}
                </Box>
                <Box flex={1}>
                  <Typography 
                    variant="subtitle1" 
                    color={index <= currentStage ? "text.primary" : "text.disabled"}
                    fontWeight={index === currentStage ? 600 : 400}
                  >
                    {stage.label}
                  </Typography>
                  
                  {index === currentStage && (
                    <Fade in={true} timeout={400}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mt: 0.5, fontStyle: 'italic' }}
                      >
                        {stage.details[detailIndex]}
                      </Typography>
                    </Fade>
                  )}
                </Box>

                {index < currentStage && (
                  <Chip 
                    size="small" 
                    label="Completed" 
                    color="success" 
                    variant="outlined"
                  />
                )}
                
                {index === currentStage && (
                  <Chip 
                    size="small" 
                    label="In Progress" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Fade>
  );
};

export default ThinkingProcess; 