import { useState } from 'react';
import { Container, Paper, TextInput, Button, Title, Text, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { PasswordStrength } from './PasswordRequirement';
import './Register.css';
import { registerUser } from '../../services/authService';
import { processToken } from '../../utils/processToken';
import { useLoadingNotification } from '../../components/Notification/LoadingNotification';
import { useAuthStore } from '../../store/useAuthStore';
import AlreadyLoggedIn from '../Login/AlreadyLoggedIn';
import { notifications } from '@mantine/notifications';
import { validateRegisterForm } from '../../validations/registerValidation';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const notificationId = 'registration';
  const toggleLoadingNotification = useLoadingNotification({
    id: notificationId,
    title: 'Registering...',
    message: 'Please wait',
    successTitle: 'Registration Successful',
    successMessage: `Welcome, ${username}!`,
    errorTitle: 'Registration Failed',
    errorMessage: 'Check your credentials',
    autoClose: 2000,
  });

  const handleRegister = async () => {
    const { valid, errors: validationErrors } = validateRegisterForm(username, password);
    setErrors(validationErrors);

    if (!valid) {
      notifications.show({
        title: 'Validation Error',
        message: Object.values(validationErrors).join(' | '),
        color: 'red',
      });
      return;
    }

    toggleLoadingNotification(true);
    try {
      const response = await registerUser({ username, password });
      if (!response?.token) throw new Error('No token returned');

      processToken(response.token);
      toggleLoadingNotification(false, true);

      navigate('/');
    } catch (err: any) {
      toggleLoadingNotification(false, false, err.message || 'Failed to register');
    }
  };

  if (token) return <AlreadyLoggedIn />;

  return (
    <Container
      fluid
      className="register-container"
      h="100vh"
      display="flex"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      }}
    >
      <Paper className="register-card" radius="md" w={400}>
        <div className="register-card-inner">
          <Group align="center" mb="md">
            <Title order={2}>🌟 Register</Title>
          </Group>

          <TextInput
            label="Username"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            mb="sm"
            error={errors.username}
          />

          <PasswordStrength value={password} onChange={setPassword} />
          {errors.password && (
            <Text color="red" size="sm" mt="xs">
              {errors.password}
            </Text>
          )}

          <Button fullWidth mt="md" onClick={handleRegister}>
            Register
          </Button>

          <Text size="sm" mt="md" c="dimmed" ta="center">
            Already have an account?{' '}
            <Text component="span" color="blue" onClick={() => navigate('/login')}>
              Login
            </Text>
          </Text>
        </div>
      </Paper>
    </Container>
  );
}
