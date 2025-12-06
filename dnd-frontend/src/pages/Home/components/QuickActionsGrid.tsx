import { Card, Grid, Group, Text, ThemeIcon, Tooltip } from "@mantine/core";
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

interface Action {
  label: string;
  icon: JSX.Element;
  path: string;
}

interface Props {
  actions: Action[];
  palette: { cardBg: string; border: string; hoverBg: string; textMain: string; accent: string };
}

export function QuickActionsGrid({ actions, palette }: Props) {
  const navigate = useNavigate();

  return (
    <Grid mt="md" gutter="md" style={{ maxWidth: 960, width: "100%" }}>
      {actions.map((action) => (
        <Grid.Col key={action.label} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Tooltip label={`Open ${action.label}`} withArrow>
            <Card
              withBorder
              shadow="xl"
              radius="lg"
              onClick={() => navigate(action.path)}
              style={{
                cursor: "pointer",
                background: "rgba(25,20,50,0.55)",
                borderColor: palette.border,
                transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                color: palette.textMain,
                backdropFilter: "blur(10px)",
                paddingTop: "12px",
                paddingBottom: "12px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.35)";
                e.currentTarget.style.borderColor = palette.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = palette.border;
              }}
            >
              <Group justify="center" align="center" gap="sm">
                <ThemeIcon size={42} radius="lg" variant="gradient" gradient={{ from: palette.accent, to: "cyan" }}>
                  {action.icon}
                </ThemeIcon>
                <Text fw={700} c={palette.textMain} ta="center">
                  {action.label}
                </Text>
              </Group>
            </Card>
          </Tooltip>
        </Grid.Col>
      ))}
    </Grid>
  );
}
