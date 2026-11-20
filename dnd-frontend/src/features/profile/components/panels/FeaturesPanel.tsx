import { useState } from "react";
import {
  Stack,
  Text,
  Box,
  ActionIcon,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { AddFeatureModal } from "@features/profile/components/modals/AddFeatureModal";
import ix from "@styles/Interactive.module.css";

function FeatureCard({ name, description }: { name: string; description?: string }) {
  const hasDesc = !!description;

  return (
    <Box
      className={`${ix.lift} ${ix.accentLeft}`}
      style={{
        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.02))",
        borderRadius: "0 12px 12px 0",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
        borderLeft: "4px solid var(--theme-color-accent-primary, #f59e0b)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
      }}
    >
      <ExpandableSection
        title={name}
        titleContent={
          <Text
            fw={300}
            size="sm"
            style={{
              textTransform: "uppercase",
              maxWidth: "100%",
              color: "var(--theme-color-text-primary, #fff)",
              letterSpacing: "3px",
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            }}
          >
            {name}
          </Text>
        }
        color={SectionColor.Grape}
        expandable={hasDesc}
        defaultOpen={false}
        padding="sm"
        marginTop={0}
        marginBottom={0}
        style={{
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      >
        {description && (
          <MarkdownRenderer
            content={description}
            textColor="rgba(255, 255, 255, 0.8)"
          />
        )}
      </ExpandableSection>
    </Box>
  );
}

export function FeaturesPanel() {
  const character = useCurrentCharacter();
  const [addModalOpened, setAddModalOpened] = useState(false);

  if (!character) return null;

  const features = character.features ?? [];

  return (
    <>
      <ExpandableSection
        title="Features"
        color={SectionColor.Grape}
        defaultOpen
        rightSection={
          <ActionIcon
            size="md"
            radius="xl"
            className={ix.iconBtn}
            aria-label="Add feature"
            onClick={(e) => {
              e.stopPropagation();
              setAddModalOpened(true);
            }}
          >
            <IconPlus size={16} aria-hidden />
          </ActionIcon>
        }
        style={{
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
          padding: "16px",
        }}
        expandable={false}
      >
        <Stack gap="sm">
          {features.length ? (
            <Stack gap="md">
              {features.map((f, i) => (
                <FeatureCard key={i} name={f.name} description={f.description} />
              ))}
            </Stack>
          ) : (
            <Text c="dimmed" size="sm">
              No features recorded for this character.
            </Text>
          )}
        </Stack>
      </ExpandableSection>

      <AddFeatureModal opened={addModalOpened} onClose={() => setAddModalOpened(false)} />
    </>
  );
}
