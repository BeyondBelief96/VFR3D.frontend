import { Component, ReactNode } from 'react';
import { Container, Title, Text, Button, Stack, Card, Code } from '@mantine/core';
import { FiHome, FiRefreshCw } from 'react-icons/fi';
import classes from './ErrorBoundary.module.css';
import { BUTTON_COLORS, BUTTON_GRADIENTS } from '@/constants/colors';

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
        <Container size="sm" className={classes.container}>
          <Card padding="xl" radius="md" className={classes.card}>
            <Stack align="center" gap="lg">
              <Title order={1} c="red" ta="center">
                Oops! Something went wrong.
              </Title>

              <Text c="dimmed" ta="center">
                We apologize for the inconvenience. Please try refreshing the page or navigate back
                to the home page.
              </Text>

              {import.meta.env.DEV && this.state.error && (
                <Card withBorder p="md" bg="dark.7" w="100%">
                  <Text size="xs" c="red" fw={600} mb="xs">
                    Error Details (Dev Mode):
                  </Text>
                  <Code block fz={10} style={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </Code>
                </Card>
              )}

              <Stack gap="sm" w="100%">
                <Button
                  fullWidth
                  variant="gradient"
                  gradient={BUTTON_GRADIENTS.PRIMARY}
                  leftSection={<FiHome size={16} />}
                  onClick={this.handleGoHome}
                >
                  Go to Home Page
                </Button>
                <Button
                  fullWidth
                  variant="light"
                  color={BUTTON_COLORS.REFRESH}
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
