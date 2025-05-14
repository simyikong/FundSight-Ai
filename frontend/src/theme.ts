import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const primary = {
  main: '#8EC5FC',
  light: '#A78BFA',
  dark: '#23263a',
  contrastText: '#FFFFFF',
};

const secondary = {
  main: '#A78BFA',
  light: '#C3BFFA',
  dark: '#6D28D9',
  contrastText: '#FFFFFF',
};

const backgroundGradient = 'rgb(5, 3, 24) 0%,rgb(21, 27, 58) 100%)';
const glassBg = 'rgba(7, 7, 27, 0.92)';
const glassBorder = '1px solid rgba(255,255,255,0.08)';

let theme = createTheme({
  palette: {
    mode: 'dark',
    primary,
    secondary,
    background: {
      default: '#0A0A23',
      paper: glassBg,
    },
    text: {
      primary: '#fff',
      secondary: '#B0B7C3',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: 'Inter, "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      letterSpacing: 1,
      background: 'linear-gradient(135deg, #A78BFA 0%, #8EC5FC 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      background: 'linear-gradient(135deg, #A78BFA 0%, #8EC5FC 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      color: '#fff',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#fff',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#fff',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
      color: '#fff',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      fontSize: '1rem',
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: backgroundGradient,
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 27, 60, 0.95)',
          boxShadow: '0px 2px 20px 0px rgba(130, 100, 255, 0.10)',
          minHeight: 72,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: glassBg,
          borderLeft: glassBorder,
          boxShadow: '-4px 0 25px rgba(130, 100, 255, 0.10)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: glassBg,
          border: glassBorder,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 27, 60, 0.85)',
          border: glassBorder,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '1rem',
          boxShadow: 'none',
          color: '#fff',
          transition: 'all 0.2s',
          '&:hover': {
            background: 'linear-gradient(135deg, #ca90c3 0%, #3d83c1 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(61, 131, 193, 0.25)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          // background: 'linear-gradient(135deg,rgb(218, 185, 250) 0%, #8EC5FC 100%)',
          background: '#3f3d58',
          color: '#13111C',
          '&:hover': {
            background: 'linear-gradient(135deg,rgb(223, 160, 225) 0%,rgb(67, 129, 221) 100%)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(61, 131, 193, 0.25)',
          },
        },
        outlined: {
          borderColor: '#3d83c1',
          color: '#3d83c1',
          '&:hover': {
            borderColor: '#6d96c5',
            background: 'rgba(202, 144, 195, 0.08)',
            color: '#6d96c5',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 12,
          input: {
            color: '#fff',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
        input: {
          color: '#fff',
        },
      },
    },
  },
});

const responsiveDarkTheme = responsiveFontSizes(theme);

export { responsiveDarkTheme as theme };