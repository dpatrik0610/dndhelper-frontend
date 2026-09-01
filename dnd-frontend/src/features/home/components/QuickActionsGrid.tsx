import { Card, Grid, Group, Text, ThemeIcon, Tooltip } from "@mantine/core";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

export interface ActionItem {
  label: string;
  icon: JSX.Element;
  path: string;
  description: string;
}

interface Props {
  actions: ActionItem[];
}

export function QuickActionsGrid({ actions }: Props) {
  const navigate = useNavigate();

  return (
    <Grid mt="md" gutter="md" style={{ width: "100%" }}>
      {actions.map((action) => (
        <Grid.Col key={action.label} span={{ base: 12, sm: 6, md: 4 }}>
          <Tooltip label={action.description} withArrow position="bottom" openDelay={400}>
            <Card
              withBorder
              shadow="lg"
              radius="md"
              onClick={() => navigate(action.path)}
              style={{
                cursor: "pointer",
                background: "var(--theme-bg-card, rgba(255,255,255,0.03))",
                borderColor: "var(--theme-border-subtle, rgba(255,255,255,0.06))",
                transition: "all 0.22s ease-in-out",
                color: "var(--theme-color-text-primary, #fff)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                padding: "16px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "var(--theme-glow-shadow-primary, 0 8px 24px rgba(0,0,0,0.3))";
                e.currentTarget.style.borderColor = "var(--theme-border-glow, var(--theme-color-accent-primary))";
                e.currentTarget.style.background = "var(--theme-bg-hover, rgba(255,255,255,0.06))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255,255,255,0.06))";
                e.currentTarget.style.background = "var(--theme-bg-card, rgba(255,255,255,0.03))";
              }}
            >
              <Group wrap="nowrap" align="center" gap="md">
                <ThemeIcon
                  size={46}
                  radius="md"
                  variant="gradient"
                  gradient={{
                    from: "var(--theme-color-accent-primary, #7c3aed)",
                    to: "var(--theme-color-accent-secondary, #06b6d4)",
                  }}
                  styles={{
                    root: {
                      boxShadow: "var(--theme-glow-shadow-secondary)",
                    }
                  }}
                >
                  {action.icon}
                </ThemeIcon>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={800} size="sm" style={{ color: "var(--theme-color-text-primary, #fff)" }}>
                    {action.label}
                  </Text>
                  <Text size="xs" style={{ color: "var(--theme-color-text-secondary, rgba(255,255,255,0.6))" }} truncate="end">
                    {action.description}
                  </Text>
                </div>
              </Group>
            </Card>
          </Tooltip>
        </Grid.Col>
      ))}
    </Grid>
  );
}
