import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Box,
  Avatar,
  Grid,
  Divider,
} from "@mantine/core";
import type { ReactNode } from "react";
import type { Character } from "@appTypes/Character/Character";
import { XpProgressCard } from "@components/common/XpProgressCard";
import CustomBadge from "@components/common/CustomBadge";
import { classSummary } from "@utils/hitDice";

interface Props {
  campaignName: string | null;
  character: Character | null;
  onSelectCharacter: () => void;
  onProfile: () => void;
  isMobile?: boolean;
  characterSelector?: ReactNode;
}

export function HeaderCard({
  character,
  onSelectCharacter,
  onProfile,
  characterSelector,
  isMobile = false,
}: Props) {
  return (
    <Paper
      radius="lg"
      p="xl"
      withBorder
      style={{
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        color: "var(--theme-color-text-primary, #fff)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
      }}
    >
      <Grid gutter="xl" align="center">
        <Grid.Col span={{ base: 12, md: character ? 7 : 12 }}>
          <Group align="center" gap="lg" wrap="nowrap">
            {character?.imageUrl ? (
              <Avatar
                src={character.imageUrl}
                size={84}
                radius="xl"
                style={{
                  border: "none",
                }}
              />
            ) : (
              <ThemeIcon
                size={84}
                radius="xl"
                variant="gradient"
                gradient={{
                  from: "var(--theme-color-accent-primary, #f59e0b)",
                  to: "var(--theme-color-accent-secondary, #10b981)",
                }}
                styles={{
                  root: {
                    boxShadow: "var(--theme-glow-shadow-primary)",
                    border: "none",
                  },
                }}
              >
                <Text fw={900} size="2rem" style={{ color: "var(--theme-color-text-primary, #ffffff)" }}>
                  {character?.name?.charAt(0) ?? "?"}
                </Text>
              </ThemeIcon>
            )}

            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
              <Title
                order={2}
                className="narrative-title"
                style={{
                  color: "var(--theme-color-text-primary, #fff)",
                  fontSize: isMobile ? "1.25rem" : "1.5rem",
                  letterSpacing: "0.5px",
                }}
              >
                {character?.name ?? "No Character Selected"}
              </Title>
              <Text
                size="xs"
                style={{
                  color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.6))",
                  fontWeight: 600,
                }}
              >
                {character
                  ? `${character.race ?? ""} • ${classSummary(character)} (Level ${character.level ?? 1})`
                  : "Select a character to initialize your adventure!"}
              </Text>

              {character && (
                <Group gap="xs" mt={4} wrap="wrap">
                  <CustomBadge label={`HP ${character.hitPoints}/${character.maxHitPoints}`} variant="outline" color="red" size="sm" style={{ fontWeight: 700, fontSize: "11px" }} />
                  <CustomBadge label={`AC ${character.armorClass}`} variant="outline" color="yellow" size="sm" style={{ fontWeight: 700, fontSize: "11px" }} />
                  <CustomBadge label={`Inspirations: ${character.inspiration ?? 0}`} variant="outline" color="violet" size="sm" style={{ fontWeight: 700, fontSize: "11px" }} />
                </Group>
              )}
            </Stack>
          </Group>
        </Grid.Col>

        {character && (
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Box style={{ width: "100%" }}>
              <XpProgressCard
                experience={character.experience}
                containerStyle={{
                  background: "rgba(255, 255, 255, 0.015)",
                  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.05))",
                  borderRadius: "12px",
                  padding: "12px 16px",
                }}
              />
            </Box>
          </Grid.Col>
        )}
      </Grid>

      <Divider
        my="lg"
        style={{
          borderColor: "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        }}
      />

      <Group
        gap="md"
        justify={isMobile ? "stretch" : "flex-end"}
        wrap={isMobile ? "wrap" : "nowrap"}
        style={{ width: "100%" }}
      >
        {character ? (
          <>
            <Button
              size="sm"
              className="glass-btn-secondary"
              onClick={onSelectCharacter}
              style={{
                height: "40px",
                borderRadius: "8px",
                flex: isMobile ? 1 : "unset",
              }}
            >
              Change Hero
            </Button>
            <Button
              size="sm"
              className="glass-btn-primary"
              onClick={onProfile}
              style={{
                height: "40px",
                borderRadius: "8px",
                flex: isMobile ? 1 : "unset",
                fontWeight: 700,
              }}
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
              width: isMobile ? "100%" : "auto",
              borderRadius: "8px",
            }}
          >
            Select Character
          </Button>
        )}
      </Group>

      {characterSelector}
    </Paper>
  );
}
