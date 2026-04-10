import { createRootRoute } from '@tanstack/react-router';
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
