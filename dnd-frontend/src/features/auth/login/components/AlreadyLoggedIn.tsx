import { Button, Text, Title, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '@utils/handleLogout';

export default function AlreadyLoggedIn() {
  const navigate = useNavigate();

  return (
    <Stack gap="lg" align="center">
      <Title order={1} className="portal-header-title">
        D&D Reforged
      </Title>
      
      <Text className="portal-header-subtitle" style={{ marginBottom: "8px" }}>
        You Are Already Logged In
      </Text>

      <Stack gap="md" style={{ width: '100%', marginTop: '12px' }}>
        <Button
          fullWidth
          onClick={() => navigate('/')}
          className="glass-btn-primary"
          h={50}
          style={{ textTransform: "uppercase", letterSpacing: "1.5px", fontSize: "15px" }}
        >
          Enter Campaign
        </Button>

        <Button
          fullWidth
          onClick={() => handleLogout()}
          className="glass-btn-secondary"
          h={50}
          style={{ textTransform: "uppercase", letterSpacing: "1.5px", fontSize: "15px" }}
        >
          Logout
        </Button>
      </Stack>
    </Stack>
  );
}
