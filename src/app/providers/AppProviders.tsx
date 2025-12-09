import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { NotificationProvider } from './NotificationProvider';
import { useUiStore } from '../store/useUiStore';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb'
    },
    secondary: {
      main: '#0f172a'
    }
  }
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa'
    },
    secondary: {
      main: '#0f172a'
    },
    background: {
      default: '#020617',
      paper: '#020617'
    }
  }
});

export interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const themeMode = useUiStore((s) => s.themeMode);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ErrorBoundary>
          <NotificationProvider>{children}</NotificationProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
};
