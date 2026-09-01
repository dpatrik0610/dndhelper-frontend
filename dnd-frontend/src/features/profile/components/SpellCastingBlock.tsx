import { SimpleGrid, Tooltip, Divider, Text } from "@mantine/core";
import { ExpandableSection } from "@components/ExpandableSection";
import { StatBox } from "./StatBox";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useCurrentCharacter, useCharacterCoreActions } from "@store/character/characterSelectors";
import { SectionColor } from "@appTypes/SectionColor";
import type { SpellSlot } from "@appTypes/Character/SpellSlot";
import { showNotification } from "@components/Notification/Notification";
import { updateCharacter } from "@services/characterService";

export function SpellCastingBlock() {
  const character = useCurrentCharacter()!;
  const { updateCharacter: updateStore } = useCharacterCoreActions();

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

  const spellSlotHandler = (slot: SpellSlot) => {
    const all = character.spellSlots;
    const foundIndex = all.findIndex(x => x.level == slot.level);
    if (foundIndex === -1) return;

    const found = all[foundIndex];

    if (!found?.current || found?.current <= 0) {
      showNotification({
        id: "spellslot-used",
        title: "",
        message: "Spell Level Depleted.",
        color: SectionColor.Yellow,
        icon: <IconExclamationCircle />
      });
      return;
    }

    const updatedSlots = [...all];
    updatedSlots[foundIndex] = { ...found, current: found.current - 1 };

    updateStore({ spellSlots: updatedSlots });
    
    const updatedCharacter = { ...character, spellSlots: updatedSlots };
    updateCharacter(updatedCharacter);
  };

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

  return (
    <>
      <ExpandableSection
        title="Spellcasting"
        defaultOpen
        color={SectionColor.Red}
        transparent
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
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mt="md" mb="md">
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
          >
            <StatBox
              fullWidth
              label="Spell Attack Bonus"
              value={character?.spellAttackBonus ? `+${character.spellAttackBonus}` : "-"}
              size="xs"
              color="red"
              background="dark"
            />
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

        <Divider
          my="md"
          color="rgba(255, 255, 255, 0.08)"
          label={
            <Text
              size="xs"
              fw={300}
              style={{
                textTransform: "uppercase",
                letterSpacing: "4px",
                color: "var(--theme-color-text-secondary, rgba(255, 255, 255, 0.7))",
                fontSize: "11px",
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              }}
            >
              Spell Slots
            </Text>
          }
          labelPosition="center"
        />

        <SimpleGrid cols={3}>
          {generateSpellSlots()}
        </SimpleGrid>
      </ExpandableSection>
    </>
  );
}
