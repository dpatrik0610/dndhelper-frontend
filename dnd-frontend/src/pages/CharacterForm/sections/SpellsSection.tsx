import { ActionIcon, Autocomplete, Button, Group, Stack, Text} from "@mantine/core";
import { useSpellStore } from "../../../store/useSpellStore";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { useEffect, useState } from "react";
import { getSpellNames } from "../../../services/spellService";
import { useAuthStore } from "../../../store/useAuthStore";
import {  IconTrash, IconWand } from "@tabler/icons-react";
import { useCharacterFormStore } from "../../../store/useCharacterFormStore";
import { SectionColor } from "../../../types/SectionColor";
import "../../../styles/glassyInput.css"


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

    const addCharacterSpell = () => {
        if(!selectedSpell) return;
        const spellId = getSpellIdByName(selectedSpell);
        if(!spellId) return;

        let chSpellList = characterForm.spells;
        chSpellList = [...chSpellList, spellId]
        setCharacterForm({spells: chSpellList})
    }

    const removeCharacterSpell = (spellId: string) => {
        const updated = formAdapter.values["spells"].filter((i: string) => i !== spellId);
        formAdapter.setFieldValue("spells", updated);
    };

    const getSpellNameById = (spellId: string) => {
        return spellNames.find(x => x.id == spellId)?.name
    }

    const getSpellIdByName = (spellName : string) => {
        return spellNames.find(x => x.name == spellName)?.id;
    }

    return (
        <ExpandableSection title="Character Spells" defaultOpen={true}>
        <Group align="flex-end" gap="xs">
        <Autocomplete
            flex={1}
            w="100%"
            classNames={{ input: "glassy-input", label: "glassy-label" }}
            leftSection={<IconWand size={18} />}
            data={spellNames
            .filter(spell => !characterForm.spells?.includes(spell.id))
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
            {formAdapter.values["spells"]?.map((spellId: string) =>(
                <Group
                key={spellId}
                justify="space-between"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 6,
                    padding: "4px 8px",
                }}>
                    <Text size="sm" c="gray.2">{getSpellNameById(spellId) || "Unknown spell."}</Text>

                    <ActionIcon color="red" variant="light" onClick={() => removeCharacterSpell(spellId)}>
                        <IconTrash size={14} />
                    </ActionIcon>
                </Group>
            ))}
        </Stack>
        </ExpandableSection>
    )
}