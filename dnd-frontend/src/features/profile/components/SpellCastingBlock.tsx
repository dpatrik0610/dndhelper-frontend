import { SimpleGrid, Tooltip } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { StatBox } from "./StatBox";
import { IconExclamationCircle, IconWand } from "@tabler/icons-react";
import { useCharacterStore } from "@store/useCharacterStore";
import { SectionColor } from "@appTypes/SectionColor";
import { DividerWithLabel } from "@components/common/DividerWithLabel";
import type { SpellSlot } from "@appTypes/Character/SpellSlot";
import { showNotification } from "@components/Notification/Notification";
import { updateCharacter } from "@services/characterService";
import { useAuthStore } from "@store/useAuthStore";

export function SpellCastingBlock() {
    const character = useCharacterStore((state) => state.character)!;
    const { updateCharacter : updateStore } = useCharacterStore();
    const abilityLabelMap: Record<string, string> = {
        wis: "Wisdom",
        int: "Intelligence",
        cha: "Charisma",
        con: "Constitution",
        str: "Strength",
        dex: "Dexterity",
        none: "None",
    };
    const spellcastingAbilityLabel =
        character?.spellcastingAbility !== undefined
            ? abilityLabelMap[character.spellcastingAbility.toLowerCase?.() ?? ""] ??
              character.spellcastingAbility
            : "Unknown";

    const updateAPI = async () => {
        await updateCharacter(character, useAuthStore.getState().token!);
    }
    
    const spellSlotHandler = (slot : SpellSlot) => {
        const all = character.spellSlots;
        const found = all.find(x => x.level == slot.level);

        if (!found?.current || found?.current <= 0) {
            showNotification({id: "spellslot-used", title:"", message: "Spell Level Depleted.", color: SectionColor.Yellow, icon: <IconExclamationCircle/>})
            return;
        }
        found!.current -= 1;

        updateStore({spellSlots: all});
        updateAPI();
    }

    function generateSpellSlots() {
        if (!character?.spellSlots) return [];
        return character.spellSlots.map((slot, index) => (
        <StatBox
            variant="galaxy"
            key={index}
            label={`${slot.level}. Level`}
            value={`${slot.current} / ${slot.max}`}
            size="sm"
            color="grape.5"
            background="transparent"
            onClick={() => spellSlotHandler(slot)}
        />
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
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="md" mb="md" >

        {/* Spell Save DC */}
        <Tooltip
            label={
            <>
                <strong>Spell Save DC</strong> = 8 + your <em>Proficiency Bonus</em> + your <em>Spellcasting Ability Modifier</em>.<br />
                Determines how hard it is for enemies to resist your spells.
            </>
            }
            color="dark"
            withArrow
            multiline
            maw={260}
        >
        <StatBox
        fullWidth
        label="Spell Save DC"
        value={character?.spellSaveDc ?? "-"}
        size="xs"
        color="red"
        background="dark"
        />
        </Tooltip>

        {/* Spell Attack Bonus */}
        <Tooltip
            label={
            <>
                <strong>Spell Attack Bonus</strong> = your <em>Proficiency Bonus</em> + your <em>Spellcasting Ability Modifier</em>.<br />
                Used for attack rolls with spells (e.g., Fire Bolt, Guiding Bolt).
            </>
            }
            color="dark"
            withArrow
            multiline
            maw={260}
        >{
        <StatBox
        fullWidth
        label="Spell Attack Bonus"
        value={character?.spellAttackBonus ? `+${character.spellAttackBonus}` : "-"}
        size="xs"
        color="red"
        background="dark"
        />}
        </Tooltip>

        <StatBox
            variant="bordered"
            fullWidth
            label="Spellcasting Ability"
            value={spellcastingAbilityLabel}
            size="xs"
            color="red"
            background="dark"
        />
    </SimpleGrid>

    <DividerWithLabel
    label="Spell Slots"
    thickness="2px"
    color={SectionColor.Pink}
    />

    <SimpleGrid cols={3}>
        {generateSpellSlots()}
    </SimpleGrid>
    </ExpandableSection>
    </>
}
