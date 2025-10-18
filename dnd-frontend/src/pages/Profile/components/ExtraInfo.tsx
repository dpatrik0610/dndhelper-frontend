import { ExpandableSection } from "../../../components/ExpendableSection";
import { StatBox } from "./StatBox";
import { IconInfoCircle } from "@tabler/icons-react";
import { Stack, Title } from "@mantine/core";
import type { Character } from "../../../types/Character/Character";


export function ExtraInfo({character}: {character: Character}) {
  return (
    <ExpandableSection
      title="Additional Info"
      icon={<IconInfoCircle size={18} />}
      color="teal"
      transparent
      defaultOpen={false}
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
      <Stack gap="xs" mt="sm">
        <Title order={4}>Physical Description</Title>
        <StatBox label="Eyes" value={character.eyes ?? null} color="gray" size="sm"/>
        <StatBox label="Hair" value={character.hair ?? null} color="gray" size="sm"/>
        <StatBox label="Height" value={character.height ?? null} color="gray" size="sm"/>
        <StatBox label="Weight" value={character.weight ?? null} color="gray" size="sm"/>
        <StatBox label="Age" value={character.age ?? null} color="gray" size="sm"/>
        <StatBox label="Skin" value={character.skin ?? null} color="gray" size="sm"/>
        <StatBox label="Appearance" value={character.appearance ?? null} color="gray" size="sm"/>
      </Stack>
      <Stack gap="xs" mt="sm">
        <Title order={4}>Personality</Title>
        <StatBox label="Personality Traits" value={character.personalityTraits ?? null} color="gray" size="sm"/>
        <StatBox label="Ideals" value={character.ideals ?? null} color="gray" size="sm"/>
        <StatBox label="Bonds" value={character.bonds ?? null} color="gray" size="sm"/>
        <StatBox label="Flaws" value={character.flaws ?? null} color="gray" size="sm"/>
        <StatBox label="Additional Notes" value={character.notes ?? null} color="gray" size="sm"/>
      </Stack>
      <StatBox label="Backstory" value={character.backstory?.join("\n")} color="gray" size="xs"/>
    </ExpandableSection>
  );
}
