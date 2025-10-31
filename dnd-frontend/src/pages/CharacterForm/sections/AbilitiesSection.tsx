import { Group, NumberInput, Stack, Title, Divider, Tooltip, SimpleGrid } from "@mantine/core";
import { useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { IconBrain } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { SectionColor } from "../../../types/SectionColor";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import "../styles/glassyInput.css"

export function AbilitiesSection() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { characterForm, setCharacterForm } = useCharacterFormStore();

  const abilityFields = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const;
  const abilityTooltips: Record<string, string> = {
    strength: "Measures physical power. Modifier = (STR - 10) / 2 (rounded down).",
    dexterity: "Agility, reflexes, and balance. Modifier = (DEX - 10) / 2.",
    constitution: "Endurance and vitality. Modifier = (CON - 10) / 2.",
    intelligence: "Reasoning and memory. Modifier = (INT - 10) / 2.",
    wisdom: "Perception and insight. Modifier = (WIS - 10) / 2.",
    charisma: "Personality and leadership. Modifier = (CHA - 10) / 2.",
  };
  const saveTooltips: Record<string, string> = {
    strength: "STR Save = STR Modifier + Proficiency (if proficient).",
    dexterity: "DEX Save = DEX Modifier + Proficiency (if proficient).",
    constitution: "CON Save = CON Modifier + Proficiency (if proficient).",
    intelligence: "INT Save = INT Modifier + Proficiency (if proficient).",
    wisdom: "WIS Save = WIS Modifier + Proficiency (if proficient).",
    charisma: "CHA Save = CHA Modifier + Proficiency (if proficient).",
  };

  const modifiers = useMemo(() => {
    const s = characterForm.abilityScores;
    const calc = (v?: number) => Math.floor(((v ?? 10) - 10) / 2);
    return { strength: calc(s.str), dexterity: calc(s.dex), constitution: calc(s.con), intelligence: calc(s.int), wisdom: calc(s.wis), charisma: calc(s.cha) };
  }, [characterForm.abilityScores]);

  return (
    <ExpandableSection title="Abilities & Spellcasting" icon={<IconBrain />} color={SectionColor.Teal} defaultOpen>
      <Stack gap={isMobile ? "sm" : "md"}>
        <Title order={isMobile ? 6 : 5} c="gray.2">Ability Scores</Title>
        <SimpleGrid cols={isMobile ? 1 : 2} spacing={isMobile ? "sm" : "md"} verticalSpacing={isMobile ? "sm" : "md"}>
          {abilityFields.map((a) => (
            <Tooltip key={a} label={abilityTooltips[a]} color="dark" withArrow multiline maw={250}>
              <Group gap="xs" align="flex-end" style={{ width: "100%", justifyContent: "space-between" }}>
                <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label={a.charAt(0).toUpperCase() + a.slice(1)} min={1} max={30} value={(characterForm.abilityScores as any)[a.slice(0, 3)]}
                  onChange={(v)=>setCharacterForm({abilityScores:{...characterForm.abilityScores,[a.slice(0,3)]:typeof v==="number"?v:v?Number(v):10}})}
                  styles={{ label:{fontWeight:500}, input:{textAlign:"center"} }} style={{ flex:1 }}/>
                <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Mod" value={modifiers[a]} readOnly styles={{label:{textAlign:"center",fontWeight:450,opacity:0.8},input:{textAlign:"center",background:"#000f3a3d",border:"1px solid rgba(0,255,255,0.36)"}}} style={{ width:"90px" }}/>
              </Group>
            </Tooltip>
          ))}
        </SimpleGrid>

        <Divider my="sm" label="Saving Throws" labelPosition="center" />
        <Stack gap={isMobile ? "xs" : "sm"}>
          {(isMobile ? abilityFields : [abilityFields.slice(0,3), abilityFields.slice(3)]).map((g, i) => (
            <Group key={i} grow wrap={isMobile ? "wrap" : "nowrap"}>
              {(Array.isArray(g)?g:[g]).map((a)=>(
                <Tooltip key={`${a}-save`} label={saveTooltips[a]} color="dark" withArrow multiline maw={250}>
                  <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label={`${a.charAt(0).toUpperCase()+a.slice(1)} Save`} value={(characterForm.savingThrows as any)[a]}
                    onChange={(v)=>setCharacterForm({savingThrows:{...characterForm.savingThrows,[a]:typeof v==="number"?v:v?Number(v):0}})}
                    styles={{input:{textAlign:"center"}}}/>
                </Tooltip>
              ))}
            </Group>
          ))}
        </Stack>

        <Divider my="sm" label="Spellcasting" labelPosition="center" />
        <Group grow wrap={isMobile ? "wrap" : "nowrap"}>
          <Tooltip label="Spell Save DC = 8 + Proficiency Bonus + Spellcasting Ability Modifier" color="dark" withArrow>
            <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Spell Save DC" value={characterForm.spellSaveDc}
              onChange={(v)=>setCharacterForm({spellSaveDc:typeof v==="number"?v:v?Number(v):0})}
              style={{ flex:1, minWidth:isMobile?"100%":0 }}/>
          </Tooltip>
          <Tooltip label="Spell Attack Bonus = Proficiency Bonus + Spellcasting Ability Modifier" color="dark" withArrow>
            <NumberInput classNames={{ input: "glassy-input", label: "glassy-label" }} label="Spell Attack Bonus" value={characterForm.spellAttackBonus}
              onChange={(v)=>setCharacterForm({spellAttackBonus:typeof v==="number"?v:v?Number(v):0})}
              style={{ flex:1, minWidth:isMobile?"100%":0 }}/>
          </Tooltip>
        </Group>
      </Stack>
    </ExpandableSection>
  );
}
