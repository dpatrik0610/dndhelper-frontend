import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Select,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { getConditions } from "../../../services/conditionService";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { updateCharacter } from "../../../services/characterService";
import { useAuthStore } from "../../../store/useAuthStore";
import { loadCharacters } from "../../../utils/loadCharacter";

interface AddConditionModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddConditionModal({ opened, onClose }: AddConditionModalProps) {
  const character = useCharacterStore((state) => state.character);
  const [conditions, setConditions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore.getState().token!;

  useEffect(() => {
    async function loadConditions() {
      setLoading(true);
      const result = await getConditions();
      setConditions(result);
      setLoading(false);
    }
    if (opened) loadConditions();
  }, [opened]);

  const handleAdd = async () => {
    if (!selected || !character) return;
    if (character.conditions.includes(selected)) {
      notifications.show({
        title: "Already Added",
        message: `${selected} is already applied to this character.`,
        color: "yellow",
      });
      return;
    }
    character.conditions = [...character.conditions, selected];
    console.log("Current conditions in the store: ", character.conditions);

    const apiResponse = await updateCharacter(character, token);
    if (apiResponse) console.log("Condition added to the API: " + apiResponse.conditions)
    loadCharacters(token)

    notifications.show({
      title: "Condition Added",
      message: `${selected} condition has been applied.`,
      color: "teal",
    });

    onClose();
    setSelected(null);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="✨ Add Condition"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 6,
      }}
      transitionProps={{ transition: "fade", duration: 180 }}
      styles={{
        header: { background: "transparent" },
        title: {
          color: "#fff",
          textShadow: "0 0 8px rgba(255,120,100,0.6)",
          fontWeight: 600,
        },
        content: {
          background:
            "linear-gradient(145deg, rgba(25,10,10,0.9), rgba(40,0,0,0.7))",
          border: "1px solid rgba(255,100,100,0.25)",
          boxShadow:
            "0 0 14px rgba(255,90,90,0.25), inset 0 0 8px rgba(255,0,0,0.15)",
          backdropFilter: "blur(8px)",
          transition: "box-shadow 0.25s ease, transform 0.25s ease",
        },
        body: { paddingTop: "1rem" },
      }}
    >
      <Stack gap="sm">
        {loading ? (
          <Group justify="center" py="md">
            <Loader color="red" />
          </Group>
        ) : (
          <>
            <Select
              label="Select a condition"
              placeholder="Choose a condition..."
              data={conditions}
              searchable
              value={selected}
              onChange={setSelected}
              nothingFoundMessage="No conditions found"
              styles={{
                input: {
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                },
                dropdown: {
                  background: "rgba(30,0,0,0.8)",
                  border: "1px solid rgba(255,80,80,0.25)",
                  backdropFilter: "blur(6px)",
                },
                option: {
                  "&[dataHovered]": {
                    background: "linear-gradient(90deg,#ff5f5f44,#ff7f00aa)",
                    color: "white",
                  },
                },
              }}
            />

            <Group justify="flex-end" mt="sm">
              <Button
                onClick={handleAdd}
                disabled={!selected}
                leftSection={<IconPlus size={16} />}
                variant="gradient"
                gradient={{ from: "#ff4d4d", to: "#ff9933", deg: 45 }}
                radius="md"
                style={{
                  boxShadow:
                    "0 0 6px rgba(255,100,100,0.4), inset 0 0 4px rgba(255,255,255,0.15)",
                  transition: "box-shadow 0.25s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 14px rgba(255,140,80,0.8)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 0 6px rgba(255,100,100,0.4)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Add Condition
              </Button>
            </Group>
          </>
        )}
        <Text
          size="xs"
          c="dimmed"
          ta="center"
          style={{ textShadow: "0 0 6px rgba(255,80,80,0.4)" }}
        >
          Conditions represent physical or magical effects applied to your character.
        </Text>
      </Stack>
    </Modal>
  );
}
