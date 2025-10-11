import { Button, Text } from '@mantine/core';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function AlreadyLoggedIn() {
  const navigate = useNavigate();

  return (
    <>
      <Text>You are already logged in.</Text>
      <Button
        mt="md"
        fullWidth
        onClick={() => {
          useAuthStore.getState().clearAuthData();
          localStorage.removeItem('authToken');
          localStorage.removeItem('username');
          navigate('/login');
        }}
      >
        Logout
      </Button>

      <Button
      mt="md"
      fullWidth
      onClick={() => {
        navigate('/home');
      }
    }
      >
        Home
      </Button>
    </>
  );
}
