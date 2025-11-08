import {
  Group,
  Stack,
  Text,
  Divider,
  Card,
  ThemeIcon,
  SimpleGrid,
} from "@mantine/core";
import { IconStars, IconSparkles } from "@tabler/icons-react";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";

export function FeaturesPanel() {
  const character = useCharacterStore((s) => s.character);
  if (!character) return null;

  const features = character.features ?? [];

  const FeatureCard = ({ name, description }: { name: string; description?: string }) => (
    <Card
      shadow="sm"
      radius="md"
      withBorder
      p="sm"
      style={{
        background: "linear-gradient(175deg, rgba(45,0,75,0.4), rgba(15,0,30,0.4))",
        border: "1px solid rgba(170, 90, 255, 0.25)",
        backdropFilter: "blur(6px)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <Stack gap={4}>
        <Group gap="xs" align="center">
          <ThemeIcon
            variant="gradient"
            gradient={{ from: "grape", to: "violet", deg: 135 }}
            radius="xl"
            size="sm"
          >
            <IconSparkles size={14} />
          </ThemeIcon>
          <Text fw={600} size="sm" c="grape.1">
            {name}
          </Text>
        </Group>

        {description && (
          <Text size="xs" c="dimmed" lh={1.4}>
            {description}
          </Text>
        )}
      </Stack>
    </Card>
  );

  return (
    <ExpandableSection
      title="Features"
      color={SectionColor.Grape}
      defaultOpen
      style={{
        background: "linear-gradient(175deg, #2a002a7e 0%, rgba(15, 0, 30, 0.7) 100%)",
        borderRadius: 10,
        boxShadow: "0 0 12px rgba(170, 90, 255, 0.25)",
        padding: "12px 16px",
      }}
    >
      <Stack gap="md">
        <Group gap="xs" align="center">
          <ThemeIcon
            variant="gradient"
            gradient={{ from: "grape", to: "violet", deg: 135 }}
            radius="xl"
          >
            <IconStars size={18} />
          </ThemeIcon>
          <Text fw={600} size="lg" c="grape.1">
            Character Features
          </Text>
        </Group>

        <Divider color="grape.8" />

        {features.length ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" verticalSpacing="sm">
            {features.map((f, i) => (
              <FeatureCard key={i} name={f.name} description={f.description} />
            ))}
          </SimpleGrid>
        ) : (
          <Text c="dimmed" size="sm">
            No features recorded for this character.
          </Text>
        )}
      </Stack>
    </ExpandableSection>
  );
}
