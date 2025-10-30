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

interface CharacterFormPageProps {
  editMode?: boolean;
}

export function CharacterFormPage({ editMode = false }: CharacterFormPageProps) {
  const { form, handleSubmit, loading, isAdmin } = useCharacterForm(editMode);
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Box
      maw={900}
      mx="auto"
      mt={isMobile ? "sm" : "xl"}
      px={isMobile ? undefined : "xl"}
      pos="relative"
      w="100%"
    >
      <LoadingOverlay visible={loading} />

      <Paper
        p={isMobile ? "sm" : "xl"}
        radius="md"
        withBorder
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          borderColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* --- Header --- */}
        <Group
          justify="space-between"
          mb={isMobile ? "sm" : "md"}
          align="center"
          wrap="wrap"
        >
          <Title order={isMobile ? 3 : 2} c="gray.1" mb={isMobile ? 4 : 0}>
            {editMode ? "Edit Character" : "Create New Character"}
          </Title>
          {editMode ? (
            <IconEdit size={isMobile ? 20 : 24} />
          ) : (
            <IconUserPlus size={isMobile ? 20 : 24} />
          )}
        </Group>

        {/* --- Form --- */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          {/* Buttons */}
          <Group
            justify="space-between"
            mt={isMobile ? "md" : "lg"}
            grow={isMobile}
            gap="sm"
            align="center"
            wrap="wrap"
          >
            <Button
              type="button"
              fullWidth={isMobile}
              variant="gradient"
              onClick={() =>
                editMode ? navigate("/profile") : navigate("/home")
              }
              style={{
                background:
                  "linear-gradient(195deg, #e581e9ff, #44afe0ff)",
                color: SectionColor.Black,
              }}
            >
              Go Back
            </Button>

            <Button
              type="submit"
              fullWidth={isMobile}
              variant="gradient"
              gradient={{
                from: editMode ? "orange" : "cyan",
                to: editMode ? "red" : "blue",
              }}
            >
              {editMode ? "Save Changes" : "Create Character"}
            </Button>
          </Group>

          {/* --- Sections --- */}
          <Stack gap={isMobile ? "sm" : "md"} mt={isMobile ? "md" : "lg"}>
            <BasicInfoSection form={form} />
            <CombatStatsSection form={form} />
            <AbilitiesSection form={form} />
            <SkillsSection form={form} />
            <LoreSection form={form} />
            <CollectionsSection form={form} />
            {isAdmin && <AdminSection form={form} />}
            <DeleteCharacterSection />
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
