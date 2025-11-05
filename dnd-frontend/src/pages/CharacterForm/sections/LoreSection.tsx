import { Stack, Textarea, Group, NumberInput, TextInput } from "@mantine/core";
import { IconBook } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import "../../../styles/glassyInput.css"

export function LoreSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  return (
    <ExpandableSection title="Lore & Personality" icon={<IconBook />} color={SectionColor.Orange} defaultOpen>
      <Stack>
        <Group grow>
          <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Age" value={characterForm.age} onChange={(v)=>setCharacterForm({age:typeof v==="number"?v:v?Number(v):0})}/>
          <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Height" value={characterForm.height} onChange={(e)=>setCharacterForm({height:e.currentTarget.value})}/>
          <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Weight" value={characterForm.weight} onChange={(e)=>setCharacterForm({weight:e.currentTarget.value})}/>
        </Group>
        <Group grow>
          <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Eyes" value={characterForm.eyes} onChange={(e)=>setCharacterForm({eyes:e.currentTarget.value})}/>
          <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Skin" value={characterForm.skin} onChange={(e)=>setCharacterForm({skin:e.currentTarget.value})}/>
          <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Hair" value={characterForm.hair} onChange={(e)=>setCharacterForm({hair:e.currentTarget.value})}/>
        </Group>
        <Textarea classNames={{ input: "glassy-input", label: "glassy-label" }} label="Appearance" autosize value={characterForm.appearance} onChange={(e)=>setCharacterForm({appearance:e.currentTarget.value})}/>
        <Textarea classNames={{ input: "glassy-input", label: "glassy-label" }} label="Personality Traits" autosize value={characterForm.personalityTraits} onChange={(e)=>setCharacterForm({personalityTraits:e.currentTarget.value})}/>
        <Textarea classNames={{ input: "glassy-input", label: "glassy-label" }} label="Ideals" autosize value={characterForm.ideals} onChange={(e)=>setCharacterForm({ideals:e.currentTarget.value})}/>
        <Textarea classNames={{ input: "glassy-input", label: "glassy-label" }} label="Bonds" autosize value={characterForm.bonds} onChange={(e)=>setCharacterForm({bonds:e.currentTarget.value})}/>
        <Textarea classNames={{ input: "glassy-input", label: "glassy-label" }} label="Flaws" autosize value={characterForm.flaws} onChange={(e)=>setCharacterForm({flaws:e.currentTarget.value})}/>
        <Textarea classNames={{ input: "glassy-input", label: "glassy-label" }} label="Backstory" autosize value={characterForm.backstory.join("\n")} onChange={(e)=>setCharacterForm({backstory:e.currentTarget.value.split("\n")})}/>
        <Textarea classNames={{ input: "glassy-input", label: "glassy-label" }} label="Notes" autosize value={characterForm.notes} onChange={(e)=>setCharacterForm({notes:e.currentTarget.value})}/>
      </Stack>
    </ExpandableSection>
  );
}
