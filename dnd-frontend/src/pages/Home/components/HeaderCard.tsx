import { Button, Group, Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ConnectionStatus } from "../../../components/ConnectionStatus";
import type { ReactNode } from "react";
import type { Character } from "../../../types/Character/Character";

interface Props {
  campaignName: string | null;
  character: Character | null;
  onSelectCharacter: () => void;
  onProfile: () => void;
  isMobile?: boolean;
  characterSelector?: ReactNode;
  palette: { bg: string; border: string; textMain: string; textDim: string };
  quote?: string;
}

export function HeaderCard({
  campaignName,
  character,
  onSelectCharacter,
  onProfile,
  characterSelector,
  isMobile = false,
  palette,
  quote,
}: Props) {
  return (
    <Paper radius="md" p="lg" withBorder style={{ background: palette.bg, borderColor: palette.border, backdropFilter: "blur(8px)", color: palette.textMain }}>
      {/* Line 1: campaign + status */}
      <Group justify="space-between" align="center" wrap={isMobile ? "wrap" : "nowrap"} gap="md">
        <Title order={2} style={{ color: palette.textMain }}>
          {campaignName || "Campaign"}
        </Title>
        <ConnectionStatus />
      </Group>
      {quote && (
        <Text size="sm" fs="italic" c={palette.textDim} mt={4}>
          {quote}
        </Text>
      )}

      {/* Line 2: character + actions */}
      <Group
        mt="sm"
        gap="md"
        justify="space-between"
        align={isMobile ? "flex-start" : "center"}
        wrap={isMobile ? "wrap" : "nowrap"}
      >
        <Group align="center" gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <ThemeIcon size={56} radius="xl" variant="gradient" gradient={{ from: "grape", to: "indigo" }}>
            <Text fw={800}>{character?.name?.charAt(0) ?? "?"}</Text>
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={700} c={palette.textMain}>
              {character?.name ?? "No character selected"}
            </Text>
            <Text size="sm" c={palette.textDim}>
              {character ? `Level ${character.level} ${character.race} ${character.characterClass}` : "Select a character to view details"}
            </Text>
          </Stack>
        </Group>

        <Group
          gap="sm"
          style={{
            flexShrink: 0,
            width: isMobile ? "100%" : "auto",
            justifyContent: isMobile ? "flex-start" : "flex-end",
          }}
        >
          <Button size="xs" variant="outline" onClick={onSelectCharacter} radius="md">
            {character ? "Change Character" : "Select Character"}
          </Button>
          {character && (
            <Button size="xs" variant="light" onClick={onProfile} radius="md">
              View Profile
            </Button>
          )}
        </Group>
      </Group>

      {characterSelector}
    </Paper>
  );
}
