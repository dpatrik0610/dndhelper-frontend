import { Grid, Stack } from "@mantine/core";
import { useAiAssistantController } from "./hooks/useAiAssistantController";
import { AssistantHeader } from "./components/AssistantHeader";
import { AssistantSettings } from "./components/AssistantSettings";
import { AssistantSidebar } from "./components/AssistantSidebar";
import { AssistantChat } from "./components/AssistantChat";

export default function AiAssistantPage() {
  const controller = useAiAssistantController();

  return (
<Stack gap="xs" style={{ height: "98vh" }}>
  <AssistantHeader controller={controller} />
  <AssistantSettings controller={controller} />

  <Grid gutter="md" style={{ flex: 1 }}>
    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
      <AssistantSidebar controller={controller} />
    </Grid.Col>

    <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
      <AssistantChat controller={controller} />
    </Grid.Col>
  </Grid>
</Stack>
  );
}