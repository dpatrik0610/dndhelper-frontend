import { Grid } from "@mantine/core";
import type { Character } from "../../../types/Character/Character";
import { ExpandableSection } from "./ExpendableSection";
import { StatBox } from "./StatBox";
import { IconWand } from "@tabler/icons-react";

export function SpellBlock({character}:  {character?: Character}) {

    function generateSpellSlots() {
        if (!character?.spellSlots) return [];
        return character.spellSlots.map((slot, index) => (
            <Grid.Col span={4} key={index}>
                <StatBox 
                    key={index}
                    label={`${slot.level}. Level`}
                    value={`${slot.current} / ${slot.max}`}
                    size="sm"
                    color="red"
                    background="transparent"
                />
            </Grid.Col>
        ));
    }

    return <>
    <ExpandableSection title="Spellcasting" defaultOpen={true} icon={<IconWand size={18} />} color="red" transparent={true}>
        <Grid mt="md" mb="md" grow justify="flex-start" align="center" >
        <Grid.Col span={6}> <StatBox label="Spell Save DC" value={character?.spellSaveDc || "-"} size="xs" color="red" background="dark"/> </Grid.Col>
        <Grid.Col span={6}> <StatBox label="Spell Attack Bonus" value={character?.spellAttackBonus ? `+${character.spellAttackBonus}` : "-"} size="xs" color="red" background="dark"/> </Grid.Col>
       
            { generateSpellSlots() }
        </Grid>
    </ExpandableSection>
    </>
}