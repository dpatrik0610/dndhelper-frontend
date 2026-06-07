import { Card, Text, Group, Avatar, Badge, Stack, Progress, Tooltip, Box } from "@mantine/core";
import { IconShield, IconSword, IconEye, IconHeart } from "@tabler/icons-react";
import type { Character } from "@appTypes/Character/Character";
import styles from "./DMCharacterCard.module.css";

interface DMCharacterCardProps {
  character: Character;
  onOpenWorkspace: () => void;
  isActive?: boolean;
}

export function DMCharacterCard({ character, onOpenWorkspace, isActive }: DMCharacterCardProps) {
  const hpPercent = (character.hitPoints / character.maxHitPoints) * 100;

  const getHpColor = () => {
    if (hpPercent <= 0) return "dark";
    if (hpPercent <= 25) return "red";
    if (hpPercent <= 50) return "yellow";
    return "green";
  };

  return (
    <Card
      className={`${styles.card} ${isActive ? styles.activeCard : ''}`}
      onClick={onOpenWorkspace}
    >
      <Group wrap="nowrap" align="flex-start" justify="space-between">
        <Group wrap="nowrap">
          <Avatar
            src={character.imageUrl}
            size="lg"
            radius="md"
            className={styles.avatar}
          >
            {character.name.charAt(0)}
          </Avatar>

          <Stack gap={2}>
            <Text fw={700} size="lg" className={styles.name} truncate>
              {character.name}
            </Text>
            <Text size="sm" c="dimmed">
              Level {character.level} {character.characterClass}
            </Text>
          </Stack>
        </Group>
      </Group>

      <Box mt="md" mb="sm">
        <Group justify="space-between" mb={4}>
          <Group gap={4}>
            <IconHeart size={14} className={styles.statIcon} style={{ color: 'var(--mantine-color-red-5)' }} />
            <Text size="sm" fw={600}>{character.hitPoints} / {character.maxHitPoints}</Text>
          </Group>
          {character.temporaryHitPoints > 0 && (
            <Badge size="sm" variant="dot" color="blue">+{character.temporaryHitPoints} THP</Badge>
          )}
        </Group>
        <Progress value={hpPercent} color={getHpColor()} size="sm" radius="xl" />
      </Box>

      <Group grow mt="md">
        <Tooltip label="Armor Class">
          <Badge variant="light" color="gray" leftSection={<IconShield size={12} />}>
            {character.armorClass} AC
          </Badge>
        </Tooltip>

        <Tooltip label="Initiative">
          <Badge variant="light" color="indigo" leftSection={<IconSword size={12} />}>
            {character.initiative >= 0 ? `+${character.initiative}` : character.initiative} Init
          </Badge>
        </Tooltip>

        <Tooltip label="Passive Perception">
          <Badge variant="light" color="cyan" leftSection={<IconEye size={12} />}>
            {character.passivePerception} PP
          </Badge>
        </Tooltip>
      </Group>

      {character.conditions && character.conditions.length > 0 && (
        <Group gap="xs" mt="sm">
          {character.conditions.map(cond => (
            <Badge key={cond} size="xs" color="red" variant="filled">
              {cond}
            </Badge>
          ))}
        </Group>
      )}
    </Card>
  );
}
