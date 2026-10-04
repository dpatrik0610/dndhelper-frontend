import { useState } from "react";
import { Avatar, Button, Group, Paper, Select, Stack, Text } from "@mantine/core";
import { IconPlus, IconUserCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useCharacterList, useCurrentCharacter } from "@store/character/characterSelectors";
import type { Character } from "@appTypes/Character/Character";
import { TokenSection } from "@features/settings/characters/TokenSection";
import { DangerZone } from "@features/settings/characters/DangerZone";

const characterSummary = (c: Character) => `Lvl ${c.level} • ${c.race} • ${c.characterClass}`;

function CharacterAvatar({ character, size }: { character?: Character; size: number }) {
  return (
    <Avatar
      src={character?.imageUrl || undefined}
      size={size}
      radius="sm"
      style={{
        background: character?.imageUrl ? "transparent" : "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
        color: "#fff",
        fontWeight: 800,
      }}
    >
      {character?.name.charAt(0).toUpperCase()}
    </Avatar>
  );
}

/** Pick a character, then manage it. Each section below is per character. */
export function CharacterSettings() {
  const navigate = useNavigate();
  const characters = useCharacterList().filter((c) => c.id);
  const current = useCurrentCharacter();
  const [selectedId, setSelectedId] = useState(current?.id);

  // Falls back to the active (or first) character, e.g. after the selected one is deleted.
  const selected = characters.find((c) => c.id === selectedId) ?? characters.find((c) => c.id === current?.id) ?? characters[0];
  const byId = new Map(characters.map((c) => [c.id!, c]));

  const newCharacterButton = (
    <Button
      leftSection={<IconPlus size={16} />}
      onClick={() => navigate("/newCharacter")}
      style={{
        flexShrink: 0,
        background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
        border: "none",
        color: "#121214",
        boxShadow: "var(--theme-glow-shadow-primary)",
        fontWeight: 700,
      }}
    >
      New character
    </Button>
  );

  if (!selected) {
    return (
      <Paper p="xl" style={{ borderRadius: 20 }}>
        <Stack align="center" gap="md" py="lg">
          <IconUserCircle size={56} style={{ opacity: 0.35, color: "var(--theme-color-accent-primary)" }} />
          <Text c="dimmed" fs="italic">
            No characters yet. Create your first adventurer to get started.
          </Text>
          {newCharacterButton}
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="xl">
      <Group gap="sm" align="flex-end" wrap="wrap">
        <Select
          label="Character"
          data={characters.map((c) => ({ value: c.id!, label: c.name }))}
          value={selected.id}
          onChange={(id) => id && setSelectedId(id)}
          allowDeselect={false}
          searchable={characters.length > 8}
          leftSection={<CharacterAvatar character={selected} size={22} />}
          renderOption={({ option }) => {
            const c = byId.get(option.value);
            return (
              <Group gap="sm" wrap="nowrap">
                <CharacterAvatar character={c} size={28} />
                <Stack gap={0} style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>
                    {option.label}
                    {c?.id === current?.id && (
                      <Text span size="xs" c="dimmed" fw={400}> · active</Text>
                    )}
                  </Text>
                  {c && <Text size="xs" c="dimmed" truncate>{characterSummary(c)}</Text>}
                </Stack>
              </Group>
            );
          }}
          style={{ flex: "1 1 240px" }}
        />
        {newCharacterButton}
      </Group>

      <TokenSection key={`token-${selected.id}`} character={selected} />
      <DangerZone key={`danger-${selected.id}`} character={selected} />
    </Stack>
  );
}
