import { Button } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { loadCharacters } from "@utils/loadCharacter";
import { useAuthStore } from "@store/useAuthStore";
import { showNotification } from "@components/Notification/Notification";
import { loadInventories } from "@utils/loadinventory";
import { loadSpells } from "@utils/loadSpells";

export default function ReloadButton() {
  const [loading, setLoading] = useState(false);

  const handleReload = async () => {
    setLoading(true);
    try {
      const token = useAuthStore.getState().token;
      await loadCharacters(token!);
      await loadInventories(token!);
      await loadSpells(token!);
      // await loadNotes(token!);

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
      size="sm"
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
