import { Component, ReactNode } from 'react';
import { Container, Title, Text, Button, Stack, Card, Code } from '@mantine/core';
import { FiHome, FiRefreshCw } from 'react-icons/fi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container
          size="sm"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--mantine-color-vfr3dSurface-9)',
          }}
        >
          <Card
            padding="xl"
            radius="md"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.9)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              maxWidth: 500,
              width: '100%',
            }}
          >
            <Stack align="center" gap="lg">
              <Title order={1} c="red" ta="center">
                Oops! Something went wrong.
              </Title>

              <Text c="dimmed" ta="center">
                We apologize for the inconvenience. Please try refreshing the page or navigate back
                to the home page.
              </Text>

              {import.meta.env.DEV && this.state.error && (
                <Card withBorder p="md" bg="dark.7" style={{ width: '100%' }}>
                  <Text size="xs" c="red" fw={600} mb="xs">
                    Error Details (Dev Mode):
                  </Text>
                  <Code block style={{ whiteSpace: 'pre-wrap', fontSize: 10 }}>
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </Code>
                </Card>
              )}

              <Stack gap="sm" style={{ width: '100%' }}>
                <Button
                  fullWidth
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  leftSection={<FiHome size={16} />}
                  onClick={this.handleGoHome}
                >
                  Go to Home Page
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  color="gray"
                  leftSection={<FiRefreshCw size={16} />}
                  onClick={this.handleRefresh}
                >
                  Refresh Page
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
