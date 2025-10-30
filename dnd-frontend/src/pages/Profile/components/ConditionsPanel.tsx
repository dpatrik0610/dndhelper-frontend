import { useState } from "react";
import {
  Badge,
  Box,
  Group,
  Modal,
  Stack,
  Text,
  Loader,
  ActionIcon,
  Button,
} from "@mantine/core";
import { IconSearch, IconSparkles, IconTrash } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { getCondition } from "../../../services/conditionService";
import { updateCharacter } from "../../../services/characterService";
import { useAuthStore } from "../../../store/useAuthStore";

export function ConditionsPanel() {
  const character = useCharacterStore((state) => state.character);
  const token = useAuthStore.getState().token!;

  const [opened, setOpened] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [desc, setDesc] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async (condition: string) => {
    setSelected(condition);
    setDesc([]);
    setOpened(true);
    setLoading(true);

    const result = await getCondition(condition);
    setDesc(result);
    setLoading(false);
  };

  const handleRemoveFromModal = () => {
    if (selected && character) {
          character.conditions = character.conditions.filter((c => c !== selected));
      setOpened(false);
      updateCharacter(character, token);
    }
  };

  if (!character?.conditions || character.conditions.length === 0) {
    return null;
  }

  return (
    <>
      <ExpandableSection
        title="Active Conditions"
        icon={<IconSparkles />}
        color={SectionColor.Red}
        defaultOpen
      >
        <Stack gap="sm">
          <Group gap="xs">
            {character.conditions.map((condition) => (
              <Badge
                key={condition}
                color="red"
                variant="gradient"
                gradient={{ from: "red", to: "orange", deg: 45 }}
                radius="md"
                size="lg"
                rightSection={
                  <Group gap={4}>
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      onClick={() => handleOpen(condition)}
                      title="View details"
                    >
                      <IconSearch size={14} />
                    </ActionIcon>
                  </Group>
                }
                style={{
                  background: "rgba(255, 60, 60, 0.15)",
                  border: "1px solid rgba(255, 100, 100, 0.3)",
                  backdropFilter: "blur(6px)",
                  transition: "all 0.25s ease",
                }}
              >
                {condition}
              </Badge>
            ))}
          </Group>
        </Stack>
      </ExpandableSection>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        title={selected ? selected.toUpperCase() : "Condition"}
        overlayProps={{
          backgroundOpacity: 0.6,
          blur: 4,
        }}
        transitionProps={{ transition: "fade", duration: 200 }}
        styles={{
          header: {
            fontWeight: "bold",
            background: "transparent",
            letterSpacing: "1px",
          },
          content: {
            background:
              "linear-gradient(145deg, rgba(40,0,0,0.9), rgba(20,0,0,0.65))",
            border: "1px solid rgba(255,0,0,0.25)",
            boxShadow:
              "0 0 15px rgba(255,60,60,0.2), inset 0 0 10px rgba(255,0,0,0.1)",
            transition: "box-shadow 0.25s ease, transform 0.25s ease",
          },
          title: { color: "white" },
        }}
      >
        <Box p="sm">
          {loading ? (
            <Group justify="center" py="md">
              <Loader color="red" />
            </Group>
          ) : desc.length > 0 ? (
            <Stack gap="xs">
              {desc.map((line, i) => (
                <Text key={i} size="sm" c="gray.1">
                  {line}
                </Text>
              ))}
            </Stack>
          ) : (
            <Text size="sm" c="dimmed" ta="center">
              No detailed description found for this condition.
            </Text>
          )}

          {selected && (
            <Group justify="flex-end" mt="md">
              <Button
                variant="gradient"
                gradient={{ from: "red", to: "orange", deg: 45 }}
                size="xs"
                onClick={handleRemoveFromModal}
                leftSection={<IconTrash size={14} />}
                style={{
                  boxShadow:
                    "0 0 6px rgba(255,100,100,0.5), inset 0 0 4px rgba(255,255,255,0.1)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 14px rgba(255,150,80,0.8)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 6px rgba(255,100,100,0.5)")
                }
              >
                Remove Condition
              </Button>
            </Group>
          )}
        </Box>
      </Modal>
    </>
  );
}
