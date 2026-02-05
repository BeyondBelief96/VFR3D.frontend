import { createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ErrorBoundary } from '@/components/Layout/ErrorBoundary';

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RouteErrorComponent,
});

function RootLayout() {
  return (
    <ErrorBoundary>
      <AppLayout />
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-left" />}
    </ErrorBoundary>
  );
}

function RouteErrorComponent({ error }: { error: Error }) {
  return (
    <ErrorBoundary>
      <div style={{ padding: 20 }}>
        <h1>Route Error</h1>
        <pre>{error.message}</pre>
      </div>
    </ErrorBoundary>
  );
}
