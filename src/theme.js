import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: 'rgb(21, 147, 250)',
      transparent: 'rgba(66, 165, 245, 0.1)',
      semiTransparent: 'rgba(66, 165, 245, 0.3)',
      border: 'rgba(66, 165, 245, 0.5)',
    },
    secondary: {
      main: 'rgb(66, 164, 245)',
    },
    background: {
      default: 'rgb(30, 30, 30)',
      paper: 'rgb(47, 47, 47)',
      paperLight: '#f5f5f5',
      overlay: 'rgba(75, 75, 75, 0.9)',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0bec5',
      disabled: 'rgba(255, 255, 255, 0.6)',
    },
    error: {
      main: '#dc3545',
    },
    neutral: {
      white: '#ffffff',
      medium: '#b0bec5',
      dark: '#4B4B4B',
      darker: '#3B3B3B',
      transparent: 'rgba(255, 255, 255, 0.1)',
      semiTransparent: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      shadowHover: 'rgba(0, 0, 0, 0.15)',
      avatarBorder: 'rgba(255, 255, 255, 0.3)',
      textShadow: 'rgba(0, 0, 0, 0.3)',
      gradient: {
        button: 'linear-gradient(45deg, #4B4B4B, #5C5C5C)',
        buttonHover: 'linear-gradient(45deg, #3B3B3B, #4C4C4C)',
        buttonDisabled: 'linear-gradient(45deg, #6B6B6B, #7C7C7C)',
        overlay: 'linear-gradient(145deg, rgba(66, 165, 245, 0.3), rgba(66, 165, 245, 0.1))',
        overlayHover: 'linear-gradient(145deg, rgba(66, 165, 245, 0.4), rgba(66, 165, 245, 0.2))',
      },
    },
  },
  typography: {
    fontFamily: "'Montserrat', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    body1: {
      fontWeight: 400,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#212121',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
  },
});

export default theme;