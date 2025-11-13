import { IconSparkles } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { StatBox } from "./StatBox";
import { SimpleGrid, Loader, Center, Stack, Text} from "@mantine/core";
import { SectionColor } from "../../../types/SectionColor";
import { getSpellById } from "../../../services/spellService";
import { useAuthStore } from "../../../store/useAuthStore";
import type { Spell } from "../../../types/Spell";
import { useEffect, useState } from "react";
import { useSpellStore } from "../../../store/useSpellStore";
import CustomBadge from "../../../components/common/CustomBadge";
import { useMediaQuery } from "@mantine/hooks";
import { SpellModal } from "./SpellModal";

export function SpellsPanel() {
  const token = useAuthStore.getState().token;
  const character = useCharacterStore((state) => state.character);
  const chSpells = character?.spells;
  const [spellData, setSpellData] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Modal state
  const [modalOpened, setModalOpened] = useState(false);
  const setCurrentSpell = useSpellStore((s) => s.setCurrentSpell);

  useEffect(() => {
    const fetchSpells = async () => {
      if (!chSpells?.length) {
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          chSpells.map((id) => getSpellById(id, token!))
        );
        setSpellData(results);
      } catch (err) {
        console.error("Failed to load spells:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchSpells();
  }, [chSpells, token]);

  if (!chSpells || chSpells.length === 0)
    return (
      <ExpandableSection title="Spells" icon={<IconSparkles />} color={SectionColor.Grape} defaultOpen={true}>
        <Center>No spells known.</Center>
      </ExpandableSection>
    );

  if (loading)
    return (
      <ExpandableSection title="Spells" icon={<IconSparkles />} color={SectionColor.Grape} defaultOpen={true}>
        <Center><Loader color="grape" /></Center>
      </ExpandableSection>
    );

  return (
    <>
      <ExpandableSection title="Spells" icon={<IconSparkles />} color={SectionColor.Grape} defaultOpen={true} style={{ background: "linear-gradient(180deg, #11001a99, #36004faa)" }}>
        <SimpleGrid cols={isMobile ? 1 : 4}>
          {spellData.map((spell) => (
            <StatBox
              key={spell.name}
              label=""
              value=""
              size="md"
              variant="galaxy"
              onClick={() => {
                setCurrentSpell(spell);
                setModalOpened(true);
              }}
            >
              <Stack ta="center" align="center">
                <Text>{spell.name}</Text>
                <CustomBadge label={`Level ${spell.level}`} color={SectionColor.Lime} variant="outline" radius={5} size="lg"/>
              </Stack>
            </StatBox>
          ))}
        </SimpleGrid>
      </ExpandableSection>

      <SpellModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </>
  );
}
