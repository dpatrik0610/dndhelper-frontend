import { Button, Text, Title, Stack } from '@mantine/core';
import { useNavigate } from 'react-router';
import { handleLogout } from '@utils/handleLogout';

export default function AlreadyLoggedIn() {
  const navigate = useNavigate();

  return (
    <Stack gap="lg" align="center">
      <Title order={1} className="portal-header-title">
        D&D Reforged
      </Title>
      
      <Text className="portal-header-subtitle" style={{ marginBottom: "8px" }}>
        You're already logged in
      </Text>

      <Stack gap="md" style={{ width: '100%', marginTop: '12px' }}>
        <Button
          fullWidth
          onClick={() => navigate('/')}
          className="glass-btn-primary"
          h={50}
        >
          Continue
        </Button>

        <Button
          fullWidth
          onClick={() => handleLogout()}
          className="glass-btn-secondary"
          h={50}
        >
          Log out
        </Button>
      </Stack>
    </Stack>
  );
}
