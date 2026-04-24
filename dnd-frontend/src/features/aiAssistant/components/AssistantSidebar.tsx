import {
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconMessageCircleBolt } from "@tabler/icons-react";

export function AssistantSidebar({ controller }: any) {
  const { config, activeTopic, setActiveTopicId, isMobile } = controller;

  return (
    <Paper
      radius="lg"
      withBorder
      p="sm"
      style={{
        height: isMobile ? "auto" : "calc(100vh - 190px)",
        background: "rgba(20, 18, 40, 0.62)",
        borderColor: "rgba(255, 255, 255, 0.07)",
      }}
    >
      <ScrollArea h={isMobile ? undefined : "100%"} scrollbarSize={6}>
        <Stack gap="md">
          {config.categories.map((category: any) => {
            const topics = config.topics.filter(
              (t: any) => t.categoryId === category.id
            );
            if (!topics.length) return null;

            return (
              <Box key={category.id}>
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
                  {category.label}
                </Text>

                <Stack gap={6}>
                  {topics.map((topic: any) => {
                    const isActive = topic.id === activeTopic?.id;

                    return (
                      <UnstyledButton
                        key={topic.id}
                        onClick={() => setActiveTopicId(topic.id)}
                        style={{
                          borderRadius: 12,
                          padding: "10px 12px",
                          border: `1px solid ${
                            isActive
                              ? "rgba(177, 151, 252, 0.35)"
                              : "rgba(255,255,255,0.06)"
                          }`,
                          background: isActive
                            ? "linear-gradient(135deg, rgba(100, 65, 180, 0.72), rgba(38, 103, 168, 0.55))"
                            : "rgba(255, 255, 255, 0.02)",
                        }}
                      >
                        <Group gap="sm" wrap="nowrap">
                          <IconMessageCircleBolt
                            size={16}
                            color={isActive ? "#f3e8ff" : "#b4b4c7"}
                          />
                          <Text size="sm" fw={600}>
                            {topic.name}
                          </Text>
                        </Group>
                      </UnstyledButton>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </ScrollArea>
    </Paper>
  );
}