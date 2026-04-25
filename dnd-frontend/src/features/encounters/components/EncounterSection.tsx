import type { ReactNode } from "react";
import { Box, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";

type EncounterSectionProps = {
  title: string;
  description?: string;
  icon: ReactNode;
  children: ReactNode;
};

export function EncounterSection({ title, description, icon, children }: EncounterSectionProps) {
  return (
    <Paper p="lg" radius="md" withBorder bg="rgba(255,255,255,0.02)">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Group gap="sm" align="flex-start">
            <ThemeIcon size={38} radius="md" variant="light" color="grape">
              {icon}
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg" c="grape.0">
                {title}
              </Text>
              {description ? (
                <Text size="sm" c="dimmed">
                  {description}
                </Text>
              ) : null}
            </Box>
          </Group>
        </Group>
        {children}
      </Stack>
    </Paper>
  );
}
