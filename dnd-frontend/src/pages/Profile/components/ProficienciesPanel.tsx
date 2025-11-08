import {
  Group,
  Stack,
  Text,
  Divider,
  Badge,
  ThemeIcon,
} from "@mantine/core";
import { IconLanguage, IconSword } from "@tabler/icons-react";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";

export function ProficienciesPanel() {
  const character = useCharacterStore((s) => s.character);
  if (!character) return null;

  const renderList = (items: string[] | undefined, empty: string, badgeProps = {}) =>
    items?.length ? (
      <Group>
        {items.map((item, i) => (
          <Badge
            key={i}
            radius="sm"
            {...badgeProps}
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(128, 90, 213, 0.25)",
              textShadow: "0 0 6px rgba(180, 90, 255, 0.4)",
            }}
          >
            {item}
          </Badge>
        ))}
      </Group>
    ) : (
      <Text c="dimmed" size="sm">{empty}</Text>
    );

  const Section = ({
    icon,
    label,
    content,
  }: {
    icon: React.ReactNode;
    label: string;
    content: React.ReactNode;
  }) => (
    <Stack gap={6}>
      <Group gap="xs" align="center">
        <ThemeIcon
          variant="gradient"
          gradient={{ from: "grape", to: "violet", deg: 135 }}
          radius="xl"
        >
          {icon}
        </ThemeIcon>
        <Text fw={600} size="lg" c="grape.1">
          {label}
        </Text>
      </Group>
      {content}
    </Stack>
  );

  return (
    <ExpandableSection
      title="Proficiencies"
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
        <Section
          icon={<IconSword size={18} />}
          label="Weapons & Tools"
          content={renderList(character.proficiencies, "No proficiencies recorded.", {
            variant: "gradient",
            gradient: { from: "violet", to: "grape", deg: 145 },
          })}
        />

        <Divider color="grape.8" label="Communication" labelPosition="center" />

        <Section
          icon={<IconLanguage size={18} />}
          label="Languages"
          content={renderList(character.languages, "No known languages.", {
            variant: "dot",
            color: "grape",
          })}
        />
      </Stack>
    </ExpandableSection>
  );
}
