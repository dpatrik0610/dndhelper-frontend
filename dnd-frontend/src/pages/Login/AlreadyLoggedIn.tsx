import { Button, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../../utils/handleLogout';

export default function AlreadyLoggedIn() {
  const navigate = useNavigate();

  return (
    <>
      <Text>You are already logged in.</Text>
      <Button
        mt="md"
        fullWidth
        onClick={() => {
          handleLogout(navigate)
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
