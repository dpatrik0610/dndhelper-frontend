import { Box, Paper, Stack, Loader, Text, Group } from "@mantine/core";
import { useEffect } from "react";
import { useAdminCampaignStore } from "../../../store/admin/useAdminCampaignStore";
import { useAuthStore } from "../../../store/useAuthStore";
import { CampaignHeader } from "./CampaignHeader";
import { CampaignSelectPanel } from "./CampaignSelectHeader";
import { CampaignCharactersPanel } from "./CampaignCharactersPanel";

export function CampaignManager() {
  const { reload, loading, selectedId } = useAdminCampaignStore();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) void reload();
  }, [token]);

  if (loading)
    return (
      <Group justify="center" mt="xl">
        <Loader color="cyan" size="lg" />
      </Group>
    );

  return (
    <Box style={{ width: "100%", margin: "0 auto" }}>
      <Stack gap="md">
        <CampaignSelectPanel />
        {selectedId ? (
          <Paper
            p="sm"
            mt="md"
            radius="md"
            withBorder
            style={{
              display: "flex",
              flexDirection: "column",
              background:
                "linear-gradient(145deg, rgba(30,0,60,0.55), rgba(10,0,30,0.45))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 0 15px rgba(80,50,255,0.15)",
            }}
          >
            <CampaignHeader />
            <CampaignCharactersPanel />
          </Paper>
        ) : (
          <Text c="dimmed" ta="center">
            Select or create a campaign to begin.
          </Text>
        )}
      </Stack>
    </Box>
  );
}
