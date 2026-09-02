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
import { AddFeatureModal } from "../modals/AddFeatureModal";

export function FeaturesPanel() {
  const character = useCurrentCharacter();
  const [addModalOpened, setAddModalOpened] = useState(false);

  if (!character) return null;

  const features = character.features ?? [];

  const FeatureCard = ({ name, description }: { name: string; description?: string }) => {
    const hasDesc = !!description;

    return (
      <Box
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1.5px)";
          e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.2), var(--theme-glow-shadow-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.15)";
        }}
        style={{
          transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
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
  };

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
            style={{
              background: "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
              color: "var(--theme-color-accent-primary, #fff)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.08))";
              e.currentTarget.style.boxShadow = "var(--theme-glow-shadow-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--theme-bg-card, rgba(255, 255, 255, 0.04))";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={(e) => {
              e.stopPropagation();
              setAddModalOpened(true);
            }}
          >
            <IconPlus size={16} />
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
