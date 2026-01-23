import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Auth0Provider } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { Ion } from 'cesium';

import { store, persistor } from './redux/store';
import { routeTree } from './routeTree.gen';
import './index.css';

// Set Cesium Ion access token
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_API_KEY;

// Create the router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Mantine theme configuration
const theme = createTheme({
  primaryColor: 'blue',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
  colors: {
    // Custom VFR3D colors
    vfr3d: [
      '#e6f2ff',
      '#b3d9ff',
      '#80bfff',
      '#4da6ff',
      '#1a8cff',
      '#0073e6',
      '#005cb3',
      '#004480',
      '#002d4d',
      '#00161a',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'md',
        centered: true,
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});

// Loading component for PersistGate
const LoadingView = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#f1f5f9',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 48,
          height: 48,
          border: '4px solid #3b82f6',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px',
        }}
      />
      <p>Loading VFR3D...</p>
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI,
        audience: import.meta.env.VITE_AUTH0_VFR3D_API_AUDIENCE,
      }}
    >
      <Provider store={store}>
        <PersistGate loading={<LoadingView />} persistor={persistor}>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <Notifications position="top-right" />
            <RouterProvider router={router} />
          </MantineProvider>
        </PersistGate>
      </Provider>
    </Auth0Provider>
  </React.StrictMode>
);
