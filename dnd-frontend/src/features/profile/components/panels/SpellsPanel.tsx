import { IconSearch } from "@tabler/icons-react";
import { ExpandableSection } from "@components/ExpandableSection";
import { useCurrentCharacter } from "@store/character/characterSelectors";
import { StatBox } from "@features/profile/components/StatBox";
import {
  SimpleGrid,
  Loader,
  Center,
  Stack,
  Text,
  Box,
  TextInput,
  Select,
} from "@mantine/core";
import { SectionColor } from "@appTypes/SectionColor";
import { getSpellById } from "@services/spellService";
import { useToken } from "@store/auth/authSelectors";
import type { Spell } from "@appTypes/Spell";
import { useEffect, useMemo, useState } from "react";
import { useSpellActions } from "@store/spell/spellSelectors";
import CustomBadge from "@components/common/CustomBadge";

import { SpellModal } from "@features/profile/components/modals/SpellModal";
import type { CharacterSpell } from "@appTypes/Character/CharacterSpell";
import { useIsMobile } from "@hooks/useIsMobile";

export function SpellsPanel() {
  const token = useToken();
  const character = useCurrentCharacter();
  const chSpells = character?.spells ?? [];
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [spellData, setSpellData] = useState<Array<{ spellId: string; spell: Spell }>>([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>("all");
  const [preparedFilter, setPreparedFilter] = useState<string | null>("all");
  const glassyInputClasses = { input: "glassy-input" , label: "glassy-label", dropdown: "glassy-dropdown" };

  const { setCurrentSpell } = useSpellActions();

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
            spell: await getSpellById(spellId),
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

  if (!chSpells.length)
    return (
      <ExpandableSection
        title="Spells"
        color={SectionColor.Grape}
        style={{
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        }}
      >
        <Center py="xl">
          <Text c="dimmed">No spells known.</Text>
        </Center>
      </ExpandableSection>
    );

  if (loading)
    return (
      <ExpandableSection
        title="Spells"
        color={SectionColor.Grape}
        style={{
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        }}
      >
        <Center py="xl">
          <Loader color="var(--theme-color-accent-primary)" />
        </Center>
      </ExpandableSection>
    );

  return (
    <>
      <ExpandableSection
        title="Spells"
        color={SectionColor.Grape}
        defaultOpen
        style={{
          background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
          backdropFilter: "blur(24px) saturate(130%)",
          WebkitBackdropFilter: "blur(24px) saturate(130%)",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
        }}
      >
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm" mb="sm">
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
          </SimpleGrid>

          {Object.entries(grouped).map(([lvl, spells]) =>
            spells.length === 0 ? null : (
              <Stack key={lvl} mb="md" gap="xs">
                <Box
                  px="sm"
                  py={8}
                  style={{
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.15)",
                    border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                    boxShadow: "inset 0 0 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Text
                    ta="center"
                    c="var(--theme-color-text-primary, #fff)"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "4px",
                      fontWeight: 300,
                      fontSize: "11px",
                      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                    }}
                  >
                    {lvl === "0" ? "Cantrips" : `Level ${lvl}`}
                  </Text>
                </Box>

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
                          <Text fw={700} style={{ color: "var(--theme-color-text-primary, #fff)" }}>
                            {spell.name}
                          </Text>
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
                                background: "var(--theme-gradient-active, rgba(255, 255, 255, 0.08))",
                                borderRadius: 6,
                                border: "1px solid var(--theme-color-accent-primary, #f59e0b)",
                                boxShadow: "var(--theme-glow-shadow-primary)",
                              }}
                            >
                              <Text size="10px" fw={900} style={{ color: "var(--theme-color-text-glow, #fff)" }} lts={1.5} lh="14px">
                                PREPARED
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
