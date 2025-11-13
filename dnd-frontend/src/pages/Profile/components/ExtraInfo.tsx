import { ExpandableSection } from "../../../components/ExpendableSection";
import { StatBox } from "./StatBox";
import { IconInfoCircle } from "@tabler/icons-react";
import { Group, Stack, Text } from "@mantine/core";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { DividerWithLabel } from "../../../components/common/DividerWithLabel";


export function ExtraInfo() {
  const character = useCharacterStore((state) => state.character)!;
  return (
    <ExpandableSection
      title="Additional Info"
      icon={<IconInfoCircle size={18} />}
      color= {SectionColor.Teal}
      transparent
      defaultOpen={true}
      style={{
        background: "linear-gradient(135deg, rgba(56, 27, 0, 0.36), rgba(0, 29, 66, 0.45))",
        boxShadow: "0 0 10px rgba(100, 0, 158, 0.38), inset 0 0 6px rgba(199, 119, 15, 0.15)",
        borderColor: "rgba(36, 158, 158, 0.23)",
        borderRadius: "5px",
        transition: "all 0.90s ease-in-out",
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
