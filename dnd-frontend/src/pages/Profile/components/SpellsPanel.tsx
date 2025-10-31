import { IconSparkles } from "@tabler/icons-react";
import { ExpandableSection } from "../../../components/ExpendableSection";
import { useCharacterStore } from "../../../store/useCharacterStore";
import { StatBox } from "./StatBox";
import { SimpleGrid, Loader, Center, Stack, Text} from "@mantine/core";
import { SectionColor } from "../../../types/SectionColor";
import { Link } from "react-router-dom";
import { getSpellById } from "../../../services/spellService";
import { useAuthStore } from "../../../store/useAuthStore";
import type { Spell } from "../../../types/Spell";
import { useEffect, useState } from "react";
import { useSpellStore } from "../../../store/useSpellStore";
import CustomBadge from "../../../components/common/CustomBadge";
import { useMediaQuery } from "@mantine/hooks";

export function SpellsPanel() {
  const token = useAuthStore.getState().token;
  const character = useCharacterStore((state) => state.character);
  const chSpells = character?.spells;
  const [spellData, setSpellData] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
    
  useEffect(() => {
    const fetchSpells = async () => {
      if (!chSpells?.length) {
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.all(chSpells.map((id) => getSpellById(id, token!)));
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
      <ExpandableSection title="Spells" icon={<IconSparkles />} color={SectionColor.Grape}>
        <Center>No spells known.</Center>
      </ExpandableSection>
    );

  if (loading)
    return (
      <ExpandableSection title="Spells" icon={<IconSparkles />} color={SectionColor.Grape}>
        <Center><Loader color="grape" /></Center>
      </ExpandableSection>
    );

  return (
    <ExpandableSection title="Spells" icon={<IconSparkles />} defaultOpen={true} color={SectionColor.Grape}>
      <SimpleGrid cols={isMobile? 1 : 4}>
        {spellData.map((spell) => (
          <Link key={spell.name} to={`/spells`} style={{ textDecoration: "none" }} onClick={() => {useSpellStore.getState().setCurrentSpell(spell)}}>
            <StatBox label="" value="" size="md" color={SectionColor.Grape} style={{
                backdropFilter: "blur(10px)",
                backgroundColor: "#21003044"
            }} > 
            <Stack ta={"center"} align="center">
                <Text>{spell.name}</Text>
                <CustomBadge label={`Level ${spell.level}`} color={SectionColor.Grape} variant="outline" />
            </Stack>
            </StatBox>
          </Link>
        ))}
      </SimpleGrid>
    </ExpandableSection>
  );
}
