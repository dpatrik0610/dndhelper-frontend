import { ActionIcon, Autocomplete, Button, Group, Stack, Switch, Text, Box, Select, Divider } from "@mantine/core";
import { useSpellStore } from "@store/spell/spellStore";
import { ExpandableSection } from "@components/ExpandableSection";
import { useEffect, useMemo, useState } from "react";
import { getSpellNames } from "@services/spellService";

import { IconTrash, IconWand, IconStarFilled, IconBrain } from "@tabler/icons-react";
import { useCharacterFormStore } from "@store/character/characterFormStore";
import { SectionColor } from "@appTypes/SectionColor";
import type { CharacterSpell } from "@appTypes/Character/CharacterSpell";
import { FormNumberInput } from "@components/common/FormNumberInput";
import { InfoIconPopover } from "@components/common/InfoIconPopover";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
type SpellcastingAbility = AbilityKey | "none";

export function SpellsSection({ noBox = false }: { noBox?: boolean }) {
    const spellNames = useSpellStore((state) => state.spellNames);
    const setSpellNames = useSpellStore.getState().setSpellNames;
    const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
    const { characterForm, setCharacterForm } = useCharacterFormStore();
    const input = { input: "glassy-input", label: "glassy-label" };

    const formAdapter = {
        values: characterForm,
        setFieldValue: (field: string, value: unknown) => setCharacterForm({ [field]: value }),
    };

    useEffect(() => {
        if(!spellNames || spellNames.length == 0){
            const fetchSpells = async () => {
                const spells = await getSpellNames();
                setSpellNames(spells);
            };
            fetchSpells();
        }
    }, [spellNames])

    const spells = useMemo(
        () =>
            (characterForm.spells ?? []).map((spell: CharacterSpell) =>
                typeof spell === "string" ? { spellId: spell, isPrepared: false } : spell
            ),
        [characterForm.spells]
    );

    const addCharacterSpell = () => {
        if (!selectedSpell) return;
        const spellId = getSpellIdByName(selectedSpell);
        if (!spellId) return;

        const updated = [...spells, { spellId, isPrepared: false }];
        setCharacterForm({ spells: updated });
        setSelectedSpell(null);
    };

    const removeCharacterSpell = (spellId: string) => {
        const updated = spells.filter((i) => i.spellId !== spellId);
        formAdapter.setFieldValue("spells", updated);
    };

    const togglePrepared = (spellId: string) => {
        const updated = spells.map((spell) =>
            spell.spellId === spellId ? { ...spell, isPrepared: !spell.isPrepared } : spell
        );
        formAdapter.setFieldValue("spells", updated);
    };

    const getSpellNameById = (spellId: string) => {
        return spellNames.find(x => x.id == spellId)?.name;
    };

    const getSpellIdByName = (spellName: string) => {
        return spellNames.find(x => x.name == spellName)?.id;
    };

    // Spellcasting modifiers recalculations moved from Abilities Section
    const modifiers = useMemo(() => {
        const s = characterForm.abilityScores;
        const M = (v: number) => Math.floor((v - 10) / 2);
        return {
            str: M(s.str),
            dex: M(s.dex),
            con: M(s.con),
            int: M(s.int),
            wis: M(s.wis),
            cha: M(s.cha),
        };
    }, [characterForm.abilityScores]);

    const spellcastKey = characterForm.spellcastingAbility as SpellcastingAbility;

    const spellMod =
        spellcastKey !== "none"
            ? modifiers[spellcastKey]
            : null;

    const prof = characterForm.proficiencyBonus ?? 0;
    const spellSaveDc = spellMod !== null ? 8 + prof + spellMod : 0;
    const spellAttackBonus = spellMod !== null ? prof + spellMod : 0;

    useEffect(() => {
        if (
            characterForm.spellSaveDc !== spellSaveDc ||
            characterForm.spellAttackBonus !== spellAttackBonus
        ) {
            setCharacterForm({
                spellSaveDc,
                spellAttackBonus,
            });
        }
    }, [spellSaveDc, spellAttackBonus, characterForm.spellSaveDc, characterForm.spellAttackBonus, setCharacterForm]);

    const content = (
        <Stack gap="lg">
            {/* SEARCH AND ADD SPELL CARD */}
            <Group align="flex-end" gap="xs" wrap="nowrap">
            <Autocomplete
                flex={1}
                w="100%"
                classNames={{ input: "glassy-input", label: "glassy-label", dropdown: "glassy-dropdown" }}
                leftSection={<IconWand size={18} />}
                data={spellNames
                .filter(spell => !spells.some((s) => s.spellId === spell.id))
                .map(x => x.name)}
                value={selectedSpell ?? ""}
                onChange={setSelectedSpell}
                onOptionSubmit={(value) => setSelectedSpell(value)}
                placeholder="Search or select a spell..."
                label="Spell Finder"
            />

            <Button
                onClick={addCharacterSpell}
                className="glass-btn-primary"
                leftSection={<IconWand size={14} />}
                style={{
                    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    fontWeight: 300,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontSize: "10px",
                    height: "36px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                }}
            >
                Add Spell
            </Button>
            </Group>

            {/* SPELLBOOK LIST */}
            <Stack gap="xs">
                {spells.map((spell) => {
                    const isPrepared = spell.isPrepared;
                    return (
                        <Group
                            key={spell.spellId}
                            justify="space-between"
                            align="center"
                            style={{
                                background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(37,99,235,0.07))",
                                borderRadius: 10,
                                padding: "8px 12px",
                                border: "1px solid rgba(255,255,255,0.05)",
                            }}
                        >
                            <Stack gap={4} style={{ flex: 1 }}>
                                <Text size="sm" fw={600} c="gray.0">
                                    {getSpellNameById(spell.spellId) || "Unknown spell"}
                                </Text>
                                <Group gap={6}>
                                    <Text
                                        size="xs"
                                        fw={700}
                                        style={{
                                            background: isPrepared
                                                ? "linear-gradient(90deg, #1d4ed8, #2563eb)"
                                                : "rgba(255,255,255,0.06)",
                                            color: isPrepared ? "white" : "rgba(255,255,255,0.7)",
                                            padding: "2px 8px",
                                            borderRadius: 999,
                                            border: "1px solid rgba(255,255,255,0.08)",
                                        }}
                                    >
                                        {isPrepared ? "Prepared" : "Not Prepared"}
                                    </Text>
                                </Group>
                            </Stack>

                            <Group gap={10} align="center" wrap="nowrap">
                                <Text size="xs" style={{ color: isPrepared ? "var(--theme-color-text-primary, #fff)" : "var(--theme-color-text-secondary, rgba(255,255,255,0.5))" }}>
                                    {isPrepared ? "Prepared" : "Prepare"}
                                </Text>
                                <ActionIcon
                                    onClick={() => togglePrepared(spell.spellId)}
                                    variant="unstyled"
                                    aria-label={`Toggle preparation for ${getSpellNameById(spell.spellId)}`}
                                    style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                                        background: isPrepared
                                            ? "var(--theme-gradient-primary-glass, var(--theme-gradient-primary))"
                                            : "rgba(255, 255, 255, 0.01)",
                                        border: isPrepared
                                            ? "1px solid rgba(255, 255, 255, 0.2)"
                                            : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                                        boxShadow: isPrepared
                                            ? "var(--theme-glow-shadow-primary)"
                                            : "none",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isPrepared) {
                                            e.currentTarget.style.borderColor = "var(--theme-color-accent-primary)";
                                            e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255, 255, 255, 0.04))";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isPrepared) {
                                            e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.08))";
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.01)";
                                        }
                                    }}
                                >
                                    {isPrepared && (
                                        <IconStarFilled size={10} color="#fff" />
                                    )}
                                </ActionIcon>

                                <ActionIcon color="red" variant="subtle" onClick={() => removeCharacterSpell(spell.spellId)}>
                                    <IconTrash size={14} />
                                </ActionIcon>
                            </Group>
                        </Group>
                    );
                })}
            </Stack>

            {/* Spellcasting Attributes Card (Moved from Abilities Section) */}
            <Box
                style={{
                    background: "rgba(255, 255, 255, 0.015)",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
                    borderRadius: "12px",
                    padding: "16px",
                    marginTop: "16px",
                }}
            >
                <Group gap="xs" mb="sm">
                    <IconBrain size={16} style={{ color: "var(--theme-color-accent-primary)" }} />
                    <Text
                        className="narrative-title"
                        style={{
                            fontSize: "12px",
                            letterSpacing: "1.5px",
                            color: "var(--theme-color-text-primary, #fff)",
                        }}
                    >
                        Spellcasting Attributes
                    </Text>
                </Group>

                <Divider color="rgba(255,255,255,0.03)" mb="sm" />

                <Stack gap="md">
                    <Stack gap={0} style={{ flex: 1 }}>
                        <Select
                            classNames={input}
                            label={
                                <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                                    <span>Spellcasting Ability</span>
                                    <InfoIconPopover title="Spellcasting Ability">
                                        Please select the ability that your character uses for spellcasting. It's determined by your class.
                                    </InfoIconPopover>
                                </Group>
                            }
                            value={characterForm.spellcastingAbility}
                            data={[
                                { value: "none", label: "None" },
                                { value: "str", label: "Strength (STR)" },
                                { value: "dex", label: "Dexterity (DEX)" },
                                { value: "con", label: "Constitution (CON)" },
                                { value: "int", label: "Intelligence (INT)" },
                                { value: "wis", label: "Wisdom (WIS)" },
                                { value: "cha", label: "Charisma (CHA)" },
                            ]}
                            onChange={(v) =>
                                setCharacterForm({
                                    spellcastingAbility: (v ?? "none") as SpellcastingAbility,
                                })
                            }
                        />
                    </Stack>

                    <Group grow gap="md">
                        <Stack gap={0} style={{ flex: 1 }}>
                            <FormNumberInput
                                label={
                                    <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                                        <span>Spell Save DC</span>
                                        <InfoIconPopover title="Spell Save DC">
                                            Spell Save DC = 8 + Proficiency Bonus + Spellcasting Ability Modifier
                                        </InfoIconPopover>
                                    </Group>
                                }
                                classNames={input}
                                value={spellSaveDc}
                                disabled
                                hideControls
                                onChange={() => {}}
                                styles={{
                                    input: {
                                        textAlign: "center",
                                        border: "1px solid rgba(150,255,150,0.35)",
                                        color: "#c4faff",
                                        pointerEvents: "none",
                                    },
                                }}
                            />
                        </Stack>

                        <Stack gap={0} style={{ flex: 1 }}>
                            <FormNumberInput
                                label={
                                    <Group gap={4} align="center" wrap="nowrap" style={{ display: "inline-flex" }}>
                                        <span>Spell Attack Bonus</span>
                                        <InfoIconPopover title="Spell Attack Bonus">
                                            Spell Attack Bonus = Proficiency Bonus + Spellcasting Ability Modifier
                                        </InfoIconPopover>
                                    </Group>
                                }
                                classNames={input}
                                value={spellAttackBonus}
                                disabled
                                hideControls
                                onChange={() => {}}
                                styles={{
                                    input: {
                                        textAlign: "center",
                                        border: "1px solid rgba(150,150,255,0.35)",
                                        color: "#c4d4ff",
                                        pointerEvents: "none",
                                    },
                                }}
                            />
                        </Stack>
                    </Group>
                </Stack>
            </Box>
        </Stack>
    );

    if (noBox) return content;

    return (
        <ExpandableSection title="Character Spells" defaultOpen={true}>
            {content}
        </ExpandableSection>
    )
}
