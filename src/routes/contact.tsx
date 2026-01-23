import { createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Title,
  Text,
  Stack,
  TextInput,
  Textarea,
  Button,
  Card,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { notifications } from '@mantine/notifications';

export const Route = createFileRoute('/contact')({
  component: ContactPage,
});

function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      message: (value) => (value.length < 10 ? 'Message must be at least 10 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_VFR3D_EMAIL_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_CONTACT_FORM_TEMPLATE_ID,
        {
          from_name: values.name,
          from_email: values.email,
          message: values.message,
        },
        import.meta.env.VITE_EMAILJS_USER_ID
      );

      notifications.show({
        title: 'Message Sent',
        message: 'Thank you for your message! We will get back to you soon.',
        color: 'green',
      });

      form.reset();
    } catch (error) {
      console.error('Error sending email:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}
    >
      <Container size="sm" py={100}>
        <Stack gap="xl">
          <Stack align="center" gap="md">
            <Title order={1} c="white" ta="center">
              Contact Us
            </Title>
            <Text c="dimmed" size="lg" ta="center" maw={500}>
              Have questions, feedback, or need support? We'd love to hear from you.
            </Text>
          </Stack>

          <Card
            padding="xl"
            radius="md"
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            }}
          >
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Name"
                  placeholder="Your name"
                  required
                  {...form.getInputProps('name')}
                  styles={{
                    label: { color: 'white' },
                  }}
                />
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  {...form.getInputProps('email')}
                  styles={{
                    label: { color: 'white' },
                  }}
                />
                <Textarea
                  label="Message"
                  placeholder="Your message..."
                  required
                  minRows={5}
                  {...form.getInputProps('message')}
                  styles={{
                    label: { color: 'white' },
                  }}
                />
                <Button
                  type="submit"
                  loading={isSubmitting}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                  fullWidth
                  size="md"
                >
                  Send Message
                </Button>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
