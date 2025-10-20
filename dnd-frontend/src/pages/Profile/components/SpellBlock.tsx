import { Divider, Grid } from "@mantine/core";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { StatBox } from "./StatBox";
import { IconWand } from "@tabler/icons-react";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { SectionColor } from "../../../types/SectionColor";
import { useMediaQuery } from "@mantine/hooks";
import { DividerWithLabel } from "../../../components/common/DividerWithLabel";

export function SpellBlock() {
    const character = useCharacterStore((state) => state.character)!;
    const isMobile = useMediaQuery("(max-width: 768px)");

    function generateSpellSlots() {
        if (!character?.spellSlots) return [];
        return character.spellSlots.map((slot, index) => (
            <Grid.Col span={4} key={index}  >
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
    <ExpandableSection
        title="Spellcasting"
        defaultOpen
        icon={<IconWand size={18} />}
        color= {SectionColor.Red}
        transparent
        style={{
            background: "linear-gradient(180deg, rgba(29, 0, 66, 0.45), rgba(36, 0, 33, 0.23))",
            boxShadow: "0 0 10px rgba(0, 25, 53, 0.58), inset 0 0 6px rgba(74, 25, 119, 0.15)",
            borderColor: "rgba(119, 0, 255, 0.34)",
            transition: "all 0.25s ease-in-out",
            borderRadius: "12px",
        }}
    >
        <Grid mt="md" mb="md" grow justify="flex-start" align="center" >
        <Grid.Col span={isMobile? 12 : 6}> <StatBox fullWidth={isMobile? true : false} label="Spell Save DC" value={character?.spellSaveDc || "-"} size="xs" color="red" background="dark" /> </Grid.Col>
        <Grid.Col span={isMobile? 12 : 6}> <StatBox fullWidth={isMobile? true : false} label="Spell Attack Bonus" value={character?.spellAttackBonus ? `+${character.spellAttackBonus}` : "-"} size="xs" color="red" background="dark"/> </Grid.Col>
        <Grid.Col span={12}>

        <DividerWithLabel label={"Spell Slots"} thickness="2px" color={SectionColor.Pink}/>
        
        </Grid.Col>
        { generateSpellSlots() }
        </Grid>
    </ExpandableSection>
    </>
}