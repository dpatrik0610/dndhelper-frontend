import type { CSSProperties, ReactNode } from "react";
import { Badge, Group, Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { CustomDrawer } from "@components/overlay/CustomDrawer";
import { MarkdownRenderer } from "@components/MarkdownRender";
import { type RuleDetail } from "@appTypes/Rules/Rule";

interface DrawerSection {
  title: string;
  color: string;
  bullets: string[];
}

interface RuleDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  isMobile: boolean;
  detail: RuleDetail | null;
  sections: DrawerSection[];
  paletteTextDim: string;
  cardStyle: CSSProperties;
}

export function RuleDetailDrawer({
  opened,
  onClose,
  isMobile,
  detail,
  paletteTextDim,
  cardStyle,
}: RuleDetailDrawerProps) {
  const headerContent: ReactNode | null = detail ? (
    <Group justify="space-between" align="flex-start">
      <div>
        <Text fw={700}>{detail.title}</Text>
        <Group gap="xs" mt={4}>
          <Badge color="gray" variant="light" size="sm">
            {detail.category}
          </Badge>
          {detail.source && (
            <Badge size="sm" variant="outline" color="grape">
              {detail.source.title}
              {detail.source.page ? ` p.${detail.source.page}` : ""}
            </Badge>
          )}
        </Group>
      </div>
    </Group>
  ) : null;

  return (
    <CustomDrawer
      opened={opened}
      onClose={onClose}
      position={isMobile ? "bottom" : "left"}
      size={isMobile ? "100%" : "420px"}
      overlayOpacity={0.45}
      overlayBlur={4}
      padding="md"
      cardStyle={cardStyle}
      withCloseButton
      headerContent={headerContent}
    >
      {detail ? (
        <ScrollArea style={{ flex: 1 }} h="100%" offsetScrollbars scrollbarSize={8}>
          <Stack gap="sm" pb="md">
            {detail.body && detail.body.length > 0 && (
              <Paper p="sm" radius="md" withBorder style={cardStyle}>
                <MarkdownRenderer
                  content={detail.body.join("\n\n")}
                  textColor="white"
                  style={{ padding: 0, margin: 0 }}
                />
              </Paper>
            )}

            {detail.examples && detail.examples.length > 0 && (
              <Stack gap={6}>
                <Text fw={600} size="sm">
                  Examples
                </Text>
                {detail.examples.map((ex, idx) => (
                  <Paper key={idx} p="xs" radius="md" withBorder style={cardStyle}>
                    {ex.title && (
                      <Text fw={600} size="sm">
                        {ex.title}
                      </Text>
                    )}
                    <Text size="sm" c={paletteTextDim}>
                      {ex.description}
                    </Text>
                    {ex.outcome && (
                      <Text size="xs" c="white" mt={4}>
                        Outcome: {ex.outcome}
                      </Text>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}

            {detail.tags && detail.tags.length > 0 && (
              <Group gap={6} mt="xs">
                {detail.tags.map((tag) => (
                  <Badge key={tag} size="xs" variant="outline" color="grape">
                    {tag}
                  </Badge>
                ))}
              </Group>
            )}
          </Stack>
        </ScrollArea>
      ) : (
        <Text size="sm" c={paletteTextDim}>
          Loading section...
        </Text>
      )}
    </CustomDrawer>
  );
}
