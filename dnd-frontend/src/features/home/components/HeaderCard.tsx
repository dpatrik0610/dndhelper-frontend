import { Button, Group, Paper, Stack, Text, ThemeIcon, Title, Box } from "@mantine/core";
import { ConnectionStatus } from "@components/ConnectionStatus";
import type { ReactNode } from "react";
import type { Character } from "@appTypes/Character/Character";
import { XpProgressCard } from "@features/profile/components/XpProgressCard";

interface Props {
  campaignName: string | null;
  character: Character | null;
  onSelectCharacter: () => void;
  onProfile: () => void;
  isMobile?: boolean;
  characterSelector?: ReactNode;
  quote?: string;
}

export function HeaderCard({
  campaignName,
  character,
  onSelectCharacter,
  onProfile,
  characterSelector,
  isMobile = false,
  quote,
}: Props) {
  return (
    <Paper
      radius="lg"
      p="xl"
      withBorder
      style={{
        background: "var(--theme-bg-panel, rgba(15,15,15,0.45))",
        borderColor: "var(--theme-border-subtle, rgba(255,255,255,0.06))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        color: "var(--theme-color-text-primary, #fff)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Line 1: campaign + status */}
      <Group justify="space-between" align="center" wrap={isMobile ? "wrap" : "nowrap"} gap="md">
        <Title
          order={2}
          className="narrative-title"
          style={{
            color: "var(--theme-color-text-primary, #fff)",
            fontSize: isMobile ? "1.1rem" : "1.25rem",
          }}
        >
          {campaignName || "Adventure Camp"}
        </Title>
        <ConnectionStatus />
      </Group>

      {quote && (
        <Text
          size="sm"
          fs="italic"
          mt={6}
          style={{
            color: "var(--theme-color-text-secondary, rgba(255,255,255,0.65))",
            borderLeft: "2px solid var(--theme-color-accent-secondary)",
            paddingLeft: "10px",
          }}
        >
          "{quote}"
        </Text>
      )}

      {/* Line 2: character + actions */}
      <Group
        mt="md"
        gap="md"
        justify="space-between"
        align={isMobile ? "flex-start" : "center"}
        wrap={isMobile ? "wrap" : "nowrap"}
      >
        <Group align="center" gap="md" style={{ flex: 1, minWidth: 0 }}>
          <ThemeIcon
            size={58}
            radius="xl"
            variant="gradient"
            gradient={{
              from: "var(--theme-color-accent-primary, #7c3aed)",
              to: "var(--theme-color-accent-secondary, #06b6d4)",
            }}
            styles={{
              root: {
                boxShadow: "var(--theme-glow-shadow-primary)",
              }
            }}
          >
            <Text fw={900} size="xl" style={{ color: "#fff" }}>
              {character?.name?.charAt(0) ?? "?"}
            </Text>
          </ThemeIcon>
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text
              size="md"
              className="narrative-title"
              style={{
                color: "var(--theme-color-text-primary, #fff)",
              }}
            >
              {character?.name ?? "No Character Selected"}
            </Text>
            <Text size="xs" style={{ color: "var(--theme-color-text-secondary, rgba(255,255,255,0.6))" }}>
              {character
                ? `${character.race ?? ""} • ${character.className ?? ""} (Level ${character.level ?? 1})`
                : "Select a character to initialize your adventure!"}
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
          {character ? (
            <>
              <Button
                size="sm"
                className="glass-btn-secondary"
                onClick={onSelectCharacter}
                style={{ height: "38px" }}
              >
                Change Hero
              </Button>
              <Button
                size="sm"
                className="glass-btn-primary"
                onClick={onProfile}
                style={{ height: "38px" }}
              >
                Enter Profile
              </Button>
            </>
          ) : (
            <Button
              size="md"
              className="glass-btn-primary"
              onClick={onSelectCharacter}
              style={{
                height: "44px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                paddingLeft: "24px",
                paddingRight: "24px",
              }}
            >
              Select Character
            </Button>
          )}
        </Group>
      </Group>

      {character && (
        <Box mt="lg">
          <XpProgressCard experience={character.experience} />
        </Box>
      )}

      {characterSelector}
    </Paper>
  );
}
