import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconEdit, IconUserPlus } from "@tabler/icons-react";
import { useCharacterForm } from "./useCharacterForm";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { CombatStatsSection } from "./sections/CombatStatsSection";
import { CollectionsSection } from "./sections/CollectionsSection";
import { AdminSection } from "./sections/AdminSection";
import { AbilitiesSection } from "./sections/AbilitiesSection";
import { SkillsSection } from "./sections/SkillsSection";
import { LoreSection } from "./sections/LoreSection";
import { DeleteCharacterSection } from "./sections/DeleteCharacterSection";
import { SectionColor } from "../../types/SectionColor";
import { useMediaQuery } from "@mantine/hooks";
import { SpellSlotsSection } from "./sections/SpellSlotsSection";
import { SpellsSection } from "./sections/SpellsSection";

interface CharacterFormPageProps {
  editMode?: boolean;
}

export function CharacterFormPage({ editMode = false }: CharacterFormPageProps) {
  const { handleSubmit, loading, isAdmin } = useCharacterForm(editMode);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
  <Box
    maw={900}
    mx={isMobile ? 0 : "auto"}        // no horizontal margin on mobile
    mt={isMobile ? 0 : "xl"}          // optional: remove top margin if you want true full screen
    px={isMobile ? 0 : "xl"}          // no side padding on mobile
    w="100%"
    pos="relative"
  >
    <LoadingOverlay visible={loading} />

    <Paper p={isMobile ? "sm" : "xl"} radius="md" withBorder  style={{
      background: "linear-gradient(145deg, #44000033, #1300005e)"
    }}>
      <Group justify="space-between" mb={isMobile ? "sm" : "md"} align="center" wrap="wrap">
        <Title order={isMobile ? 3 : 2} c="gray.1">
          {editMode ? "Edit Character" : "Create New Character"}
        </Title>
        {editMode ? <IconEdit size={isMobile ? 20 : 24} /> : <IconUserPlus size={isMobile ? 20 : 24} />}
      </Group>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Group justify="space-between" mt="md" grow={isMobile} gap="sm" align="center" wrap="wrap">
          <Button
            type="button"
            fullWidth={isMobile}
            variant="gradient"
            onClick={() => navigate(editMode ? "/profile" : "/home")}
            gradient={{ from: editMode ? "orange" : "cyan", to: editMode ? "red" : "blue" }}
          >
            Go Back
          </Button>

          <Button
            type="submit"
            fullWidth={isMobile}
            variant="gradient"
            style={{
              background: "linear-gradient(195deg, #e581e9ff, #44afe0ff)",
              color: SectionColor.Black,
            }}
          >
            {editMode ? "Save Changes" : "Create Character"}
          </Button>
        </Group>

        <Stack gap="md" mt="lg">
          <BasicInfoSection />
          <CombatStatsSection />
          <AbilitiesSection />
          <SkillsSection />
          <SpellSlotsSection />
          <SpellsSection />
          <LoreSection />
          <CollectionsSection />
          {isAdmin && <AdminSection />}
          <DeleteCharacterSection />
        </Stack>
      </form>
    </Paper>
  </Box>
  );
}
