import { Box, Group, Title, Text, Container } from "@mantine/core";
import { useAuthStore } from "../../store/useAuthStore";
import { useSpellStore } from "../../store/useSpellStore";
import { useEffect } from "react";
import { loadSpells } from "../../utils/loadSpells";
import { SpellSelect } from "./components/SpellSelect";
import { SpellCard } from "./components/SpellCard";
import { IconDatabase } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

export default function SpellPage () {
    const token = useAuthStore.getState().token;
    const spellList = useSpellStore((state) => state.spellNames)
    const currentSpell = useSpellStore((state) => state.currentSpell)
    const isMobile = useMediaQuery("(max-width: 768px)");
    
    useEffect(() => {
        const fetchSpells = async () => {
            if (!spellList || spellList.length === 0) {
                await loadSpells(token!);
            }
        };
        void fetchSpells();
    }, [spellList, token]);



    return (
    <Box m={ isMobile? 0 : "0 auto"} maw={isMobile? "100%" : 900} w={isMobile ? "100%" : undefined} >
        <Group bg={"transparent"} justify="space-between" mb={"md"}>
            <Title order={2}> <IconDatabase size={18}/> Spell Database </Title>
            <SpellSelect/>

            {!currentSpell && 
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
                background: "linear-gradient(175deg, #0009336b 0%, rgba(48, 0, 0, 0.37) 100%)" 
                }}>
                <Title>No spell selected.</Title>
                <Text> Please search for a spell via the Box above. </Text>
                <Text>You can also filter them by their spell level.</Text>
            </Container>}

            {currentSpell && 
            <Box miw={"100%"} flex={1}>
                <SpellCard/>
            </Box>
            }
        </Group>
    </Box>
    )
}