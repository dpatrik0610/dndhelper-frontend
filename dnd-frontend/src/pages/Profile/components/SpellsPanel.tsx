import { IconSparkles, IconSearch } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { useCharacterStore } from "../../../store/useCharacterStore";
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
import { SectionColor } from "../../../types/SectionColor";
import { getSpellById } from "../../../services/spellService";
import { useAuthStore } from "../../../store/useAuthStore";
import type { Spell } from "../../../types/Spell";
import { useEffect, useMemo, useState } from "react";
import { useSpellStore } from "../../../store/useSpellStore";
import CustomBadge from "../../../components/common/CustomBadge";
import { useMediaQuery } from "@mantine/hooks";
import { SpellModal } from "./SpellModal";

export function SpellsPanel() {
  const token = useAuthStore.getState().token;
  const character = useCharacterStore((s) => s.character);
  const chSpells = character?.spells ?? [];
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [spellData, setSpellData] = useState<Spell[]>([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>("all");
  const glassyInputClasses = { input: "glassy-input" , label: "glassy-label", dropdown: "glassy-dropdown" };

  const setCurrentSpell = useSpellStore((s) => s.setCurrentSpell);

  // Load spells
  useEffect(() => {
    const load = async () => {
      if (!chSpells.length) return setLoading(false);
      try {
        setSpellData(await Promise.all(chSpells.map((id) => getSpellById(id, token!))));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [chSpells, token]);

  // Filter + group
  const grouped = useMemo(() => {
    const g: Record<number, Spell[]> = {};
    for (let lvl = 0; lvl <= 9; lvl++) g[lvl] = [];

    const filtered = spellData.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(search.toLowerCase());
      const matchesLevel =
        levelFilter === "all" ? true : s.level === Number(levelFilter);
      return matchesName && matchesLevel;
    });

    filtered.forEach((s) => g[s.level].push(s));
    return g;
  }, [spellData, search, levelFilter]);

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
              placeholder="Search spells..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />

            <Select
              classNames={glassyInputClasses}
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
                  {spells.map((spell) => (
                    <StatBox
                      key={spell.id}
                      variant="galaxy"
                      size="md"
                      label=""
                      value=""
                      onClick={() => {
                        setCurrentSpell(spell);
                        setModalOpened(true);
                      }}
                    >
                      <Stack ta="center" align="center">
                        <Text>{spell.name}</Text>
                        <CustomBadge
                          label={spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
                          color={spell.level === 0 ? SectionColor.Grape : SectionColor.Lime}
                          variant="outline"
                          radius={5}
                        />
                      </Stack>
                    </StatBox>
                  ))}
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
