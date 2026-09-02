import {
  Group,
  Stack,
  Text,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import { IconLanguage, IconSword } from "@tabler/icons-react";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { ExpandableSection } from "@components/ExpandableSection";
import { SectionColor } from "@appTypes/SectionColor";
import CustomBadge from "@components/common/CustomBadge";

export function ProficienciesPanel() {
  const character = useCurrentCharacter();
  if (!character) return null;

  const renderList = (items: string[] | undefined, empty: string) =>
    items?.length ? (
      <Group>
        {items.map((item, i) => (
          <CustomBadge
            key={i}
            label={item}
            variant="themed"
            radius="sm"
          />
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
          style={{
            background: "var(--theme-gradient-primary)",
            boxShadow: "var(--theme-glow-shadow-primary)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
          radius="xl"
        >
          {icon}
        </ThemeIcon>
        <Text fw={800} size="lg" style={{ color: "var(--theme-color-text-primary, #fff)" }}>
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
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        padding: "16px 20px",
      }}
      expandable={false}
    >
      <Stack gap="md">
        <Section
          icon={<IconSword size={18} />}
          label="Weapons & Tools"
          content={renderList(character.proficiencies, "No proficiencies recorded.")}
        />

        <Divider color="rgba(255, 255, 255, 0.08)" label="Communication" labelPosition="center" />

        <Section
          icon={<IconLanguage size={18} />}
          label="Languages"
          content={renderList(character.languages, "No known languages.")}
        />
      </Stack>
    </ExpandableSection>
  );
}
