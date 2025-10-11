import { Button } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { loadCharacters } from "../../../utils/loadCharacter";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { showNotification } from "../../../components/Notification/Notification";

interface ReloadButtonProps {
  characterId: string;
}

export default function ReloadButton({ characterId }: ReloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const { setCharacters } = useCharacterStore();

  const handleReload = async () => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      const chars = await loadCharacters(token!);
      setCharacters(chars);
      showNotification({
        id: 'profile-reload-success',
        title: 'Reload Successful',
        message: 'Character data updated!',
      });
    } catch (err) {
      console.error(err);
      showNotification({
        id: 'profile-reload-error',
        title: 'Reload Failed',
        message: 'Could not update character data.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      leftSection={<IconRefresh size={16} />}
      size="xs"
      variant="light"
      color="white"
      loading={loading}
      onClick={handleReload}
      mt={"md"}
      mb={"md"}
    >
      Reload
    </Button>
  );
}
