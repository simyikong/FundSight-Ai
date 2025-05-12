import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define primary and secondary colors
const primary = {
  main: '#4A6FE9',
  light: '#6D8CFA',
  dark: '#2F55CC',
  contrastText: '#FFFFFF',
};

const secondary = {
  main: '#5E35B1',
  light: '#7E57C2',
  dark: '#4527A0',
  contrastText: '#FFFFFF',
};

// Create theme
let theme = createTheme({
  palette: {
    mode: 'light',
    primary,
    secondary,
    background: {
      default: '#F7F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#121212',
      secondary: '#5A6A85',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(74, 111, 233, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 10px rgba(74, 111, 233, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.05)',
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

// Create dark theme
const darkTheme = createTheme({
  ...theme,
  palette: {
    mode: 'dark',
    primary,
    secondary,
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B7C3',
    },
  },
  components: {
    ...theme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E1E1E',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);
const responsiveDarkTheme = responsiveFontSizes(darkTheme);

export { theme, responsiveDarkTheme }; 