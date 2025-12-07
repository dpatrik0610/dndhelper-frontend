import {
  Badge,
  Chip,
  Divider,
  Group,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { Monster } from "@appTypes/Monster";

interface MonsterViewModalProps {
  monster: Monster | null;
  onClose: () => void;
}

export function MonsterViewModal({ monster, onClose }: MonsterViewModalProps) {
  return (
    <Modal
      opened={!!monster}
      onClose={onClose}
      title={null}
      centered
      overlayProps={{ blur: 6, color: "rgba(0,0,0,0.35)" }}
      styles={{
        content: {
          background: "rgba(20, 0, 0, 0.6)",
          border: "1px solid rgba(255, 100, 100, 0.4)",
          backdropFilter: "blur(10px)",
        },
        header: { background: "transparent", borderBottom: "none" },
      }}
      size="lg"
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} c="red.2">
              {monster?.name ?? "Unnamed"}
            </Title>
            <Text size="sm" c="dimmed">
              {monster?.source ?? "Unknown source"}
            </Text>
          </div>
          <Group gap="xs">
            {monster?.type?.type && (
              <Badge color="red" variant="light">
                {monster.type.type}
              </Badge>
            )}
            {monster?.cr !== undefined && (
              <Badge color="orange" variant="filled">
                CR {monster.cr}
              </Badge>
            )}
            <Badge color={monster?.isNpc ? "pink" : "teal"} variant="dot">
              {monster?.isNpc ? "NPC" : "Creature"}
            </Badge>
          </Group>
        </Group>

        <Text size="xs" c="dimmed" fw={700} tt="uppercase" mt="sm">
          Profile
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Paper p="sm" withBorder style={{ background: "rgba(255,255,255,0.04)" }}>
            <Text size="xs" c="gray.2" fw={700}>Size</Text>
            <Text fw={700}>{monster?.size?.join(", ") || "-"}</Text>
          </Paper>
          <Paper p="sm" withBorder style={{ background: "rgba(255,255,255,0.04)" }}>
            <Text size="xs" c="gray.2" fw={700}>Alignment</Text>
            <Text fw={700}>{monster?.alignment?.join(", ") || "-"}</Text>
          </Paper>
        </SimpleGrid>

        <Text size="xs" c="dimmed" fw={700} tt="uppercase" mt="sm">
          Communication & Perception
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Paper p="sm" withBorder style={{ background: "rgba(255,255,255,0.04)" }}>
            <Text size="xs" c="gray.2" fw={700}>Languages</Text>
            <Text fw={700}>{monster?.languages?.join(", ") || "-"}</Text>
          </Paper>
          <Paper p="sm" withBorder style={{ background: "rgba(255,255,255,0.04)" }}>
            <Text size="xs" c="gray.2" fw={700}>Senses</Text>
            <Text fw={700}>{monster?.senses?.join(", ") || "-"}</Text>
          </Paper>
        </SimpleGrid>

        <Text size="xs" c="dimmed" fw={700} tt="uppercase" mt="sm">
          Vital Stats
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
          <Paper p="sm" withBorder style={{ background: "rgba(255,255,255,0.04)" }}>
            <Text size="xs" c="gray.2" fw={700}>Hit Points</Text>
            <Text fw={700}>{monster?.hitPoints?.average ?? "-"}</Text>
            <Text size="xs" c="dimmed">{monster?.hitPoints?.formula ?? "No formula"}</Text>
          </Paper>
          <Paper p="sm" withBorder style={{ background: "rgba(255,255,255,0.04)" }}>
            <Text size="xs" c="gray.2" fw={700}>Armor Class</Text>
            <Text fw={700}>{monster?.armorClass?.join(", ") || "-"}</Text>
            <Text size="xs" c="dimmed">Passive: {monster?.passive ?? "-"}</Text>
          </Paper>
        </SimpleGrid>

        <Paper
          withBorder
          p="md"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,100,100,0.08))",
            border: "1px solid rgba(255,100,100,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Text fw={700} size="sm" tt="uppercase" c="gray.1" mb={8}>
            Speed
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm">
            {[
              { label: "Walk", value: monster?.speed?.walk },
              { label: "Fly", value: monster?.speed?.fly },
              { label: "Swim", value: monster?.speed?.swim },
              { label: "Climb", value: monster?.speed?.climb },
              { label: "Burrow", value: monster?.speed?.burrow },
            ].map((speed) => (
              <Paper
                key={speed.label}
                withBorder
                p="xs"
                style={{
                  textAlign: "center",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 0 10px rgba(255,100,100,0.15)",
                }}
              >
                <Text size="xs" fw={800} c="red.2" tt="uppercase">
                  {speed.label}
                </Text>
                <Text size="md" fw={800}>
                  {speed.value ?? "-"}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>

        <Paper
          withBorder
          p="md"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,100,100,0.08))",
            border: "1px solid rgba(255,100,100,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Text fw={700} size="sm" tt="uppercase" c="gray.1" mb={8}>
            Ability Scores
          </Text>
          <SimpleGrid cols={{ base: 3, sm: 6 }} spacing="sm">
            {[
              { label: "STR", value: monster?.abilityScores?.str },
              { label: "DEX", value: monster?.abilityScores?.dex },
              { label: "CON", value: monster?.abilityScores?.con },
              { label: "INT", value: monster?.abilityScores?.int },
              { label: "WIS", value: monster?.abilityScores?.wis },
              { label: "CHA", value: monster?.abilityScores?.cha },
            ].map((score) => (
              <Paper
                key={score.label}
                withBorder
                p="xs"
                style={{
                  textAlign: "center",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 0 10px rgba(255,100,100,0.15)",
                }}
              >
                <Text size="xs" fw={800} c="red.2" tt="uppercase">
                  {score.label}
                </Text>
                <Text size="lg" fw={800}>
                  {score.value ?? "-"}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>

        <Divider my="xs" />

        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Lore</Text>
        <Text size="sm" c="dimmed">
          {monster?.lore || "No lore provided."}
        </Text>

        <Divider my="xs" />
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">Owners</Text>
        <Group gap="xs">
          {(monster?.ownerIds?.length ?? 0) > 0 ? (
            monster?.ownerIds?.map((owner) => (
              <Chip key={owner} variant="outline" size="xs">
                {owner}
              </Chip>
            ))
          ) : (
            <Text size="xs" c="dimmed">No owners</Text>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}

