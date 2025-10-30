import { Box, Button, Group, LoadingOverlay, Paper, Stack, Title } from "@mantine/core";
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

interface CharacterFormPageProps {
  editMode?: boolean;
}

export function CharacterFormPage({ editMode = false }: CharacterFormPageProps) {
  const { form, handleSubmit, loading, isAdmin } = useCharacterForm(editMode);
  const navigate = useNavigate();

  return (
    <Box maw={900} mx="auto" mt="xl" pos="relative">
      <LoadingOverlay visible={loading} />
      <Paper
        p="xl"
        radius="md"
        withBorder
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          borderColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Group justify="space-between" mb="md">
          <Title order={2} c="gray.1">
            {editMode ? "Edit Character" : "Create New Character"}
          </Title>
          {editMode ? <IconEdit size={24} /> : <IconUserPlus size={24} />}
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <BasicInfoSection form={form} />
            <CombatStatsSection form={form} />
            <AbilitiesSection form={form} />
            <SkillsSection form={form} />
            <LoreSection form={form} />
            <CollectionsSection form={form} />
            {isAdmin && <AdminSection form={form} />}
            <DeleteCharacterSection />
          </Stack>

          <Group justify="flex-end" mt="lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => (editMode ? navigate("/profile") : navigate("/home"))}
            >
              Go Back
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: editMode ? "orange" : "cyan", to: editMode ? "red" : "blue" }}
            >
              {editMode ? "Save Changes" : "Create Character"}
            </Button>
          </Group>
        </form>
      </Paper>
    </Box>
  );
}
