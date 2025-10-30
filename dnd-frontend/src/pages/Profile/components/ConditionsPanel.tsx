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
} from "@mantine/core";
import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { getCondition } from "../../../services/conditionService";

export function ConditionsPanel() {
  const character = useCharacterStore((state) => state.character);
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

  if (!character?.conditions || character.conditions.length === 0) {
    return null; // Don't show section if no conditions
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
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    onClick={() => handleOpen(condition)}
                  >
                    <IconSearch size={14} />
                  </ActionIcon>
                }
                style={{
                  background: "rgba(255, 60, 60, 0.15)",
                  border: "1px solid rgba(255, 100, 100, 0.3)",
                  backdropFilter: "blur(6px)",
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
        styles={{
          header: {
            fontWeight: "bold",
            background: "transparent",
            letterSpacing: "2px",
            textDecoration: "underline"
          },
          content: {
            background:
              "linear-gradient(145deg, rgba(40,0,0,0.85), rgba(20,0,0,0.6))",
            border: "1px solid rgba(255,0,0,0.2)",
            boxShadow: "0 0 12px rgba(255,60,60,0.15)",
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
        </Box>
      </Modal>
    </>
  );
}
