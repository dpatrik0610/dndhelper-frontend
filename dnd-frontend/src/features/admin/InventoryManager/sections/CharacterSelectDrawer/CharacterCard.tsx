import { Paper, Group, Box, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconUser, IconArrowBackUp } from "@tabler/icons-react";
import { useAdminCharacterStore } from "@store/admin/useAdminCharacterStore";

interface CharacterCardProps {
  id: string;
  name: string;
  ownerId?: string;
  isSelected: boolean;
}

export function CharacterCard({ id, name, ownerId, isSelected }: CharacterCardProps) {
  const { select } = useAdminCharacterStore();

  return (
    <Paper
      radius="md"
      withBorder
      onClick={() => select(id)}
      style={{
        width: "100%",
        cursor: "pointer",
        background: isSelected
          ? "linear-gradient(135deg, rgba(150,50,255,0.25), rgba(255,100,255,0.2))"
          : "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))",
        border: isSelected
          ? "1px solid var(--mantine-color-grape-5)"
          : "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(6px)",
        transition: "all 0.25s ease",
        boxShadow: isSelected
          ? "0 0 12px rgba(160, 80, 255, 0.3)"
          : "0 0 6px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Group justify="space-between" align="center" p="sm">
        <Group gap="sm" align="center" style={{ flex: 1 }}>
          <Box
            style={{
              background: isSelected
                ? "linear-gradient(135deg, rgba(180,90,255,0.4), rgba(255,150,255,0.2))"
                : "rgba(255,255,255,0.05)",
              borderRadius: "50%",
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconUser
              size={18}
              color={
                isSelected
                  ? "var(--mantine-color-grape-3)"
                  : "var(--mantine-color-gray-5)"
              }
            />
          </Box>

          <Box style={{ flexGrow: 1 }}>
            <Text fw={600} size="sm" c="grape.0">
              {name}
            </Text>
            {ownerId && (
              <Text size="xs" c="dimmed" mt={-2}>
                Owner: {ownerId.slice(0, 6)}...
              </Text>
            )}
          </Box>
        </Group>

        {isSelected && (
          <Tooltip label="Deselect" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                select(null);
              }}
            >
              <IconArrowBackUp size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Paper>
  );
}
