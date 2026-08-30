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
import { AddFeatureModal } from "./AddFeatureModal";

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
          e.currentTarget.style.transform = "translateY(-1px)";
          const paper = e.currentTarget.firstElementChild as HTMLElement;
          if (paper) {
            paper.style.borderColor = "rgba(170, 90, 255, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          const paper = e.currentTarget.firstElementChild as HTMLElement;
          if (paper) {
            paper.style.borderColor = "rgba(170, 90, 255, 0.15)";
          }
        }}
        style={{
          transition: "transform 0.2s ease",
        }}
      >
        <ExpandableSection
          title={name}
          titleContent={
            <Text
              fw={750}
              size="sm"
              c="violet.1"
              lts={0.5}
              truncate="end"
              style={{
                textTransform: "uppercase",
                maxWidth: "100%",
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
            background: "rgba(255, 255, 255, 0.02)",
            borderRadius: "0 8px 8px 0",
            border: "1px solid rgba(170, 90, 255, 0.15)",
            borderLeft: "3px solid rgba(170, 90, 255, 0.65)",
            backdropFilter: "blur(6px)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
            transition: "border-color 0.2s ease",
          }}
        >
          {description && (
            <MarkdownRenderer
              content={description}
              textColor="gray.2"
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
            size="sm"
            radius="xl"
            variant="subtle"
            color="grape.1"
            onClick={(e) => {
              e.stopPropagation();
              setAddModalOpened(true);
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
        }
        style={{
          background: "linear-gradient(175deg, #2a002a7e 0%, rgba(15, 0, 30, 0.7) 100%)",
          borderRadius: 10,
          boxShadow: "0 0 12px rgba(170, 90, 255, 0.25)",
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
