import {
  Modal,
  Table,
  Avatar,
  Badge,
  Group,
  Text,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Title,
} from "@mantine/core";
import { IconStar, IconUserCheck } from "@tabler/icons-react";
import { useState } from "react";
import type { Character } from "../../types/Character/Character";

interface CharacterSelectModalProps {
  opened: boolean;
  onClose: () => void;
  characters: Character[];
  onSelect: (character: Character) => void;
}

export function CharacterSelectModal({
  opened,
  onClose,
  characters,
  onSelect,
}: CharacterSelectModalProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const rows = characters.map((char) => (
    <Table.Tr
      key={char.id}
      style={{
        background:
          selected === char.id
            ? "linear-gradient(135deg, rgba(0,255,255,0.12), rgba(0,128,128,0.2))"
            : "rgba(255,255,255,0.03)",
        cursor: "pointer",
        transition: "background 150ms ease, transform 100ms ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background =
          "linear-gradient(135deg, rgba(0,255,255,0.08), rgba(0,128,128,0.15))")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background =
          selected === char.id
            ? "linear-gradient(135deg, rgba(0,255,255,0.12), rgba(0,128,128,0.2))"
            : "rgba(255,255,255,0.03)")
      }
      onClick={() => {
        setSelected(char.id ?? null);
        onSelect(char);
        onClose();
      }}
    >
      <Table.Td>
        <Group gap="md">
          <Avatar radius="xl" size={36} color="cyan">
            {char.name.charAt(0).toUpperCase()}
          </Avatar>
          <Text fw={500} c="white">
            {char.name}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Badge color="cyan" variant="light" size="lg">
          Level {char.level}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text size="md" c="gray.4" style={{ textTransform: "capitalize" }}>
          {char.race}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group justify="flex-end" gap="xs">
          {selected === char.id && (
            <Tooltip label="Selected">
              <ActionIcon color="teal" variant="subtle">
                <IconUserCheck size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="xl"
      title={
        <Group>
          <Badge color="cyan" variant="light" size="lg">
            <IconStar size={12} />
          </Badge>
          <Title order={3} c="white">
            Choose Your Character
          </Title>
        </Group>
      }
      overlayProps={{ blur: 6, backgroundOpacity: 0.55 }}
      styles={{
        content: {
          background:
            "radial-gradient(circle at bottom, rgba(20, 30, 22, 0.98), rgba(3, 11, 44, 0.95))",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(8px)",
          color: "white",
        },
        header: {
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          marginBottom: "0.5rem",
        },
        title: { display: "flex", alignItems: "center", gap: 10 },
        close: { color: "white" },
      }}
    >
      <ScrollArea h={400}>
        <Table.ScrollContainer minWidth={600}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ color: "rgba(255,255,255,0.6)" }}>
                  Name
                </Table.Th>
                <Table.Th style={{ color: "rgba(255,255,255,0.6)" }}>
                  Level
                </Table.Th>
                <Table.Th style={{ color: "rgba(255,255,255,0.6)" }}>
                  Race
                </Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </ScrollArea>
    </Modal>
  );
}
