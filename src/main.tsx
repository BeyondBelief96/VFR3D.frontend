import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Auth0Provider } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { Ion } from 'cesium';

import { store, persistor } from './redux/store';
import { routeTree } from './routeTree.gen';
import { AuthProvider } from './components/Auth';
import { LoadingScreen } from './components/Common';
import { theme, cssVariablesResolver } from './theme';
import './index.css';

// Set Cesium Ion access token
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_API_KEY;

// Create the router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <LoadingScreen message="Get ready to Plan, Fly, Repeat..." />
  ),
  defaultPendingMs: 200,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark" cssVariablesResolver={cssVariablesResolver}>
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
          <PersistGate loading={<LoadingScreen />} persistor={persistor}>
            <Notifications position="top-right" />
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </PersistGate>
        </Provider>
      </Auth0Provider>
    </MantineProvider>
  </React.StrictMode>
);
