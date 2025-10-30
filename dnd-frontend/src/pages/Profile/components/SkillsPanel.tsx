import {
  IconAutomaticGearbox,
  IconStarFilled,
} from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { SectionColor } from "../../../types/SectionColor";
import {
  Card,
  Group,
  Text,
  Title,
  SimpleGrid,
  Stack,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { DividerWithLabel } from "../../../components/common/DividerWithLabel";

export function SkillsPanel() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const character = useCharacterStore((state) => state.character);
  const characterSkills = character?.skills;

  // 🧠 Standard 5e mapping between skills and ability scores
  const skillGroups: Record<string, string[]> = {
    Strength: ["Athletics"],
    Dexterity: ["Acrobatics", "Sleight of Hand", "Stealth"],
    Constitution: ["Willpower"],
    Intelligence: ["Arcana", "History", "Investigation", "Nature", "Religion"],
    Wisdom: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"],
    Charisma: ["Deception", "Intimidation", "Performance", "Persuasion"],
  };

  // 🧩 Group character's skills by ability
  const groupedSkills = Object.entries(skillGroups)
    .map(([ability, skills]) => ({
      ability,
      skills: characterSkills?.filter((s) =>
        skills.some(
          (name) => s.name.toLowerCase() === name.toLowerCase()
        )
      ),
    }))
    .filter((group) => group.skills && group.skills.length > 0);

  return (
    <ExpandableSection
      title="Skills"
      icon={<IconAutomaticGearbox />}
      color={SectionColor.White}
      defaultOpen
    >
      {groupedSkills.length > 0 ? (
        <Stack gap="md">
          {groupedSkills.map(({ ability, skills }) => (
            <div key={ability}>
              <DividerWithLabel label={ability} color="#FFD43B" />
              <SimpleGrid
                cols={isMobile ? 2 : 4}
                spacing="sm"
                verticalSpacing="sm"
              >
                {skills!.map((skill) => (
                  <Card
                    key={skill.name}
                    shadow="sm"
                    padding="md"
                    radius="md"
                    withBorder
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      textAlign: "center",
                    }}
                  >
                    <Group justify="space-between" gap="xs">
                      <Title order={6} c="dimmed">
                        {skill.proficient && (
                          <IconStarFilled
                            size={16}
                            color="#FFD43B"
                            style={{
                              paddingTop: 4,
                              marginRight: 3,
                              verticalAlign: "middle",
                            }}
                          />
                        )}
                        {skill.name}
                      </Title>

                      <Text
                        fw={600}
                        c={skill.proficient ? "teal.4" : "gray.4"}
                      >
                        {skill.value >= 0
                          ? `+${skill.value}`
                          : skill.value}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </SimpleGrid>
            </div>
          ))}
        </Stack>
      ) : (
        <Text size="sm" c="dimmed" ta="center">
          No skills found for this character.
        </Text>
      )}
    </ExpandableSection>
  );
}
