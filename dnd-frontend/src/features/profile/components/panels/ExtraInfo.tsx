import { ExpandableSection } from "@components/ExpandableSection";
import { StatBox } from "@features/profile/components/StatBox";
import { Group, Stack, Text } from "@mantine/core";
import { SectionColor } from "@appTypes/SectionColor";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { DividerWithLabel } from "@components/common/DividerWithLabel";


export function ExtraInfo() {
  const character = useCurrentCharacter()!;
  return (
    <ExpandableSection
      title="Additional Info"
      color={SectionColor.Teal}
      transparent
      defaultOpen={true}
      style={{
        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
        backdropFilter: "blur(24px) saturate(130%)",
        WebkitBackdropFilter: "blur(24px) saturate(130%)",
        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
        borderRadius: "16px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        transition: "all 0.25s ease-in-out",
      }}
    >
      <Stack gap="sm">
        {character.background ? <StatBox label="Background" value={character.background} color="gray" size="sm"/> : null}
      </Stack>

      <DividerWithLabel label={"Physical Attributes"} thickness="2px" color={SectionColor.Orange}/>
      <Stack gap="xs" mt="sm">
        <StatBox label="Eyes" value={character.eyes ?? null} color="gray" size="sm"/>
        <StatBox label="Hair" value={character.hair ?? null} color="gray" size="sm"/>
        <StatBox label="Height" value={character.height ?? null} color="gray" size="sm"/>
        <StatBox label="Weight" value={character.weight ?? null} color="gray" size="sm"/>
        <StatBox label="Age" value={character.age ?? null} color="gray" size="sm"/>
        <StatBox label="Skin" value={character.skin ?? null} color="gray" size="sm"/>
        <StatBox label="Appearance" value={character.appearance ?? null} color="gray" size="sm"/>
      </Stack>

      <DividerWithLabel label={"Personality"} thickness="2px" color={SectionColor.Orange}/>
      <Stack gap="xs" mt="sm">
        <StatBox label="Personality Traits" value={character.personalityTraits ?? null} color="gray" size="sm"/>
        <StatBox label="Ideals" value={character.ideals ?? null} color="gray" size="sm"/>
        <StatBox label="Bonds" value={character.bonds ?? null} color="gray" size="sm"/>
        <StatBox label="Flaws" value={character.flaws ?? null} color="gray" size="sm"/>
      </Stack>

      <DividerWithLabel label={"Backstory"} thickness="2px" color={SectionColor.Orange}/>
      <Group lts={1} ta={"center"} justify="center">
        {character.backstory?.map((line, idx) => (
          <Text key={idx}> {line} </Text>
        ))}
      </Group>
    </ExpandableSection>
  );
}
