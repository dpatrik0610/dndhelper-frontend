import { ActionIcon, Autocomplete, Button, Group, Stack, Switch, Text } from "@mantine/core";
import { useSpellStore } from "@store/useSpellStore";
import { ExpandableSection } from "@components/ExpandableSection";
import { useEffect, useMemo, useState } from "react";
import { getSpellNames } from "@services/spellService";
import { useAuthStore } from "@store/useAuthStore";
import {  IconTrash, IconWand } from "@tabler/icons-react";
import { useCharacterFormStore } from "@store/useCharacterFormStore";
import { SectionColor } from "@appTypes/SectionColor";
import type { CharacterSpell } from "@appTypes/Character/CharacterSpell";


export function SpellsSection() {
    const token = useAuthStore.getState().token!;
    const spellNames = useSpellStore((state) => state.spellNames);
    const setSpellNames = useSpellStore.getState().setSpellNames;
    const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
    const { characterForm, setCharacterForm } = useCharacterFormStore();

    const formAdapter = {
        values: characterForm,
        setFieldValue: (field: string, value: unknown) => setCharacterForm({ [field]: value }),
    };

    useEffect(() => {
        if(!spellNames || spellNames.length == 0){
            const fetchSpells = async () => {
                const spells = await getSpellNames(token);
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

    return (
        <ExpandableSection title="Character Spells" defaultOpen={true}>
        <Group align="flex-end" gap="xs">
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
        />

        <Button
            onClick={addCharacterSpell}
            size="sm"
            variant="light"
            c={SectionColor.Green}
            style={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
            Add Spell
        </Button>
        </Group>


        <Stack gap="xs" mt={15}>
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

                        <Group gap={10} align="center">
                            <Switch
                                size="xs"
                                radius="xl"
                                color={isPrepared ? "blue" : "gray"}
                                checked={isPrepared}
                                onChange={() => togglePrepared(spell.spellId)}
                                label={isPrepared ? "Un-prepare" : "Prepare"}
                                labelPosition="left"
                                styles={{
                                    label: { color: "white", fontSize: "12px", lineHeight: 1 },
                                    track: { minWidth: 36, height: 18 },
                                    thumb: { width: 14, height: 14 },
                                }}
                                aria-label="Toggle prepared"
                            />
                            <ActionIcon color="red" variant="subtle" onClick={() => removeCharacterSpell(spell.spellId)}>
                                <IconTrash size={14} />
                            </ActionIcon>
                        </Group>
                    </Group>
                );
            })}
        </Stack>
        </ExpandableSection>
    )
}
