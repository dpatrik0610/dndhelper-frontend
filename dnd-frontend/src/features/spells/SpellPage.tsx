import { Box, Group, Title, Text, Container, ActionIcon } from "@mantine/core";
import { useAuthStore } from "@store/useAuthStore";
import { useSpellStore } from "@store/useSpellStore";
import { useEffect } from "react";
import { loadSpells } from "@utils/loadSpells";
import { SpellSelect } from "./components/SpellSelect";
import { SpellCard } from "./components/SpellCard";
import { IconDatabase, IconRefresh } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useParams } from "react-router-dom";
import { getSpellById } from "@services/spellService";

export default function SpellPage() {
  const token = useAuthStore.getState().token;
  const urlParam = useParams<{ spellName?: string }>();

  const spellList = useSpellStore((state) => state.spellNames);
  const currentSpell = useSpellStore((state) => state.currentSpell);
  const setCurrentSpell = useSpellStore((state) => state.setCurrentSpell);

  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchSpells = async () => {
      if (!spellList || spellList.length === 0) await loadSpells(token!);
    };
    void fetchSpells();
  }, [spellList, token]);

  useEffect(() => {
    const fetchSpell = async () => {
      if (!urlParam || !spellList?.length) return;

      const found = spellList.find((s) => s.name === urlParam.spellName);
      if (!found) return;

      const fetchedSpell = await getSpellById(found.id!, token!);
      setCurrentSpell(fetchedSpell);
    };
    void fetchSpell();
  }, [urlParam, spellList, setCurrentSpell, token]);

  async function reload() {
    await loadSpells(token!);
    
    if (currentSpell) {
      const found = spellList.find((s) => s.id === currentSpell.id);
      if (found) {
        const refreshed = await getSpellById(found.id!, token!);
        setCurrentSpell(refreshed);
      }
    }
  }

  return (
    <Box m={isMobile ? 0 : "0 auto"} maw={isMobile ? "100%" : 900} w={isMobile ? "100%" : undefined}>
      <Group bg={"transparent"} justify="space-between" mb={"md"} align="center">
        <Title order={2}>
          <IconDatabase size={18} /> Spell Database
        </Title>

        <Group gap="xs" align="center">
          <SpellSelect />

          {/* 📌 Reload Button */}
          <ActionIcon
            variant="light"
            radius="xl"
            size="md"
            onClick={reload}
            style={{
              background: "rgba(255, 0, 0, 0.25)",
              border: "1px solid rgba(255, 80, 80, 0.4)",
              backdropFilter: "blur(6px)",
              color: "rgba(255, 180, 180, 0.9)",
              transition: "0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.45)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,0,0,0.25)";
              e.currentTarget.style.color = "rgba(255,180,180,0.9)";
            }}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>
      </Group>

      {!currentSpell ? (
        <Container
          mih={150}
          p={10}
          mt={10}
          w={"100%"}
          lts={2}
          ta={"center"}
          style={{
            borderRadius: 5,
            border: "1px solid #0000001f",
            background: "linear-gradient(175deg, #0009336b 0%, rgba(48, 0, 0, 0.37) 100%)",
          }}
        >
          <Title>No spell selected.</Title>
          <Text>Please search for a spell via the box above.</Text>
          <Text>You can also filter them by spell level.</Text>
        </Container>
      ) : (
        <Box miw={"100%"} flex={1}>
          <SpellCard />
        </Box>
      )}
    </Box>
  );
}
