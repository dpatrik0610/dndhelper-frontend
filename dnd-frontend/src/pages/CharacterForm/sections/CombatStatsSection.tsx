import { Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { IconSword } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import "../../../styles/glassyInput.css"

export function CombatStatsSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  return (
    <ExpandableSection title="Combat Statistics" icon={<IconSword />} color={SectionColor.Red} defaultOpen>
      <Stack>
        <Group grow>
          <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Armor Class" min={0} value={characterForm.armorClass} onChange={(v)=>setCharacterForm({armorClass:typeof v==="number"?v:v?Number(v):0})}/>
          <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Speed (ft)" min={0} value={characterForm.speed} onChange={(v)=>setCharacterForm({speed:typeof v==="number"?v:v?Number(v):0})}/>
        </Group>
        <Group grow>
          <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="HP" min={0} max={characterForm.maxHitPoints} value={characterForm.hitPoints} onChange={(v)=>setCharacterForm({hitPoints:typeof v==="number"?v:v?Number(v):0})}/>
          <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Max HP" min={1} value={characterForm.maxHitPoints} onChange={(v)=>setCharacterForm({maxHitPoints:typeof v==="number"?v:v?Number(v):1})}/>
          <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Temp HP" min={0} value={characterForm.temporaryHitPoints} onChange={(v)=>setCharacterForm({temporaryHitPoints:typeof v==="number"?v:v?Number(v):0})}/>
        </Group>
        <Group grow>
          <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Initiative" value={characterForm.initiative} onChange={(v)=>setCharacterForm({initiative:typeof v==="number"?v:v?Number(v):0})}/>
          <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Experience" min={0} value={characterForm.experience} onChange={(v)=>setCharacterForm({experience:typeof v==="number"?v:v?Number(v):0})}/>
          <TextInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Hit Dice" placeholder="e.g., 1d10" value={characterForm.hitDice} onChange={(e)=>setCharacterForm({hitDice:e.currentTarget.value})}/>
        </Group>
      </Stack>
    </ExpandableSection>
  );
}
