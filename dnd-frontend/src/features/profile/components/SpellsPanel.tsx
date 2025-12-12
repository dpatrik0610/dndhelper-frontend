import { IconSparkles, IconSearch } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { useCharacterStore } from "@store/useCharacterStore";
import { StatBox } from "./StatBox";
import {
  SimpleGrid,
  Loader,
  Center,
  Stack,
  Text,
  Box,
  TextInput,
  Select,
  Group,
} from "@mantine/core";
import { SectionColor } from "@appTypes/SectionColor";
import { getSpellById } from "@services/spellService";
import { useAuthStore } from "@store/useAuthStore";
import type { Spell } from "@appTypes/Spell";
import { useEffect, useMemo, useState } from "react";
import { useSpellStore } from "@store/useSpellStore";
import CustomBadge from "@components/common/CustomBadge";
import { useMediaQuery } from "@mantine/hooks";
import { SpellModal } from "./SpellModal";
import type { CharacterSpell } from "@appTypes/Character/CharacterSpell";

export function SpellsPanel() {
  const token = useAuthStore.getState().token;
  const character = useCharacterStore((s) => s.character);
  const chSpells = character?.spells ?? [];
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [spellData, setSpellData] = useState<Array<{ spellId: string; spell: Spell }>>([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>("all");
  const [preparedFilter, setPreparedFilter] = useState<string | null>("all");
  const glassyInputClasses = { input: "glassy-input" , label: "glassy-label", dropdown: "glassy-dropdown" };

  const setCurrentSpell = useSpellStore((s) => s.setCurrentSpell);

  // Load spells
  useEffect(() => {
    const load = async () => {
      if (!chSpells.length || !token) {
        setSpellData([]);
        return setLoading(false);
      }
      try {
        const fetched = await Promise.all(
          chSpells.map(async ({ spellId }) => ({
            spellId,
            spell: await getSpellById(spellId, token),
          }))
        );
        setSpellData(fetched);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [chSpells, token]);

  const preparedMap = useMemo(
    () =>
      (chSpells as CharacterSpell[]).reduce<Record<string, boolean>>((acc, { spellId, isPrepared }) => {
        acc[spellId] = isPrepared;
        return acc;
      }, {}),
    [chSpells]
  );

  // Filter + group
  const grouped = useMemo(() => {
    const g: Record<number, Array<{ spellId: string; spell: Spell }>> = {};
    for (let lvl = 0; lvl <= 9; lvl++) g[lvl] = [];

    const filtered = spellData.filter(({ spellId, spell }) => {
      const matchesName = spell.name.toLowerCase().includes(search.toLowerCase());
      const matchesLevel =
        levelFilter === "all" ? true : spell.level === Number(levelFilter);
      const matchesPrepared =
        preparedFilter === "all" ? true : preparedMap[spellId] === true;
      return matchesName && matchesLevel && matchesPrepared;
    });

    filtered.forEach((entry) => g[entry.spell.level].push(entry));
    return g;
  }, [spellData, search, levelFilter, preparedFilter, preparedMap]);

  // UI states
  if (!chSpells.length)
    return (
      <ExpandableSection title="Spells" icon={<IconSparkles />} color={SectionColor.Grape}>
        <Center>No spells known.</Center>
      </ExpandableSection>
    );

  if (loading)
    return (
      <ExpandableSection title="Spells" icon={<IconSparkles />} color={SectionColor.Grape}>
        <Center><Loader /></Center>
      </ExpandableSection>
    );

  return (
    <>
      <ExpandableSection
        title="Spells"
        icon={<IconSparkles />}
        color={SectionColor.Grape}
        defaultOpen
        style={{ background: "linear-gradient(180deg, #11001a99, #36004faa)" }}
      >
        <Stack>

          {/* 🔍 SEARCH + LEVEL FILTER */}
          <Group grow mb="sm">
            <TextInput
              classNames={glassyInputClasses}
              label="Filter by name"
              placeholder="Search spells..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />

            <Select
              classNames={glassyInputClasses}
              label="Filter by level"
              data={[
                { value: "all", label: "All" },
                { value: "0", label: "Cantrips" },
                ...Array.from({ length: 9 }, (_, i) => ({
                  value: String(i + 1),
                  label: `Level ${i + 1}`,
                })),
              ]}
              value={levelFilter}
              onChange={setLevelFilter}
              placeholder="Level"
              comboboxProps={{ position: 'bottom', middlewares: { flip: true, shift: false } }}
            />

            <Select
              classNames={glassyInputClasses}
              label="Filter by prepared"
              data={[
                { value: "all", label: "All spells" },
                { value: "prepared", label: "Prepared only" },
              ]}
              value={preparedFilter}
              onChange={setPreparedFilter}
              placeholder="Prepared"
              comboboxProps={{ position: 'bottom', middlewares: { flip: true, shift: false } }}
            />
          </Group>

          {/* SPELL GROUPS */}
          {Object.entries(grouped).map(([lvl, spells]) =>
            spells.length === 0 ? null : (
              <Stack key={lvl} mb="md" gap="xs">

                {/* Category Header */}
                <Box
                  px="sm"
                  py={4}
                  style={{
                    borderRadius: 6,
                    background:
                      lvl === "0"
                        ? "linear-gradient(90deg, #6d00b855, #d200ff55)"
                        : "linear-gradient(140deg, #6d00b855, #80286be0)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Text fw={700} ta="center" c="white" fz="sm">
                    {lvl === "0" ? "✨ Cantrips" : `🪄 Level ${lvl}`}
                  </Text>
                </Box>

                {/* Spell Grid */}
                <SimpleGrid cols={isMobile ? 2 : 4}>
                  {spells.map(({ spellId, spell }) => {
                    const isPrepared = preparedMap[spellId] ?? false;
                    return (
                      <StatBox
                        key={spellId}
                        variant="galaxy"
                        size="md"
                        label=""
                        value=""
                        onClick={() => {
                          setCurrentSpell(spell);
                          setModalOpened(true);
                        }}
                      >
                        <Stack ta="center" align="center" gap={6} style={{ width: "100%" }}>
                          <Text>{spell.name}</Text>
                          <CustomBadge
                            label={spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
                            color={spell.level === 0 ? SectionColor.Grape : SectionColor.Lime}
                            variant="outline"
                            radius={5}
                          />
                          {isPrepared && (
                            <Box
                              mt={5}
                              w="100%"
                              px={6}
                              py={2}
                              style={{
                                background: "linear-gradient(90deg, #6d4ed8, #956deb)",
                                borderRadius: 6,
                                border: "1px solid rgba(100,22,255,0.1)",
                              }}
                            >
                              <Text size="10px" fw={700} c="white" lts={1.5} lh="14px">
                                Prepared
                              </Text>
                            </Box>
                          )}
                        </Stack>
                      </StatBox>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            )
          )}

        </Stack>
      </ExpandableSection>

      <SpellModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </>
  );
}
