import { ActionIcon, Group, Paper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconMenu2 } from "@tabler/icons-react";
import { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";

interface Action {
  label: string;
  icon: JSX.Element;
  path: string;
}

interface Props {
  actions: Action[];
  palette: { bg: string; border: string; textMain: string; accent: string };
}

export function QuickActionBar({ actions, palette }: Props) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [open, setOpen] = useState(false);
  const showActions = !isMobile || open;

  return (
    <Paper
      radius="md"
      p="sm"
      style={{
        background: palette.bg,
        color: palette.textMain,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {isMobile && (
        <ActionIcon
          size="lg"
          radius="md"
          variant="light"
          color="violet"
          aria-label="Toggle quick actions"
          onClick={() => setOpen((v) => !v)}
        >
          <IconMenu2 size={18} />
        </ActionIcon>
      )}

      {showActions && (
        <Group gap="sm" wrap={isMobile ? "wrap" : "nowrap"} justify="flex-start" style={{ width: "100%" }}>
          {actions.map((action) => (
            <Group
              key={action.label}
              gap={8}
              align="center"
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "transform 0.12s ease, background 0.12s ease",
                width: isMobile ? "100%" : "auto",
                justifyContent: "flex-start",
                border: isMobile ? `1px solid ${palette.border}` : "none",
                background: isMobile ? "rgba(255,255,255,0.04)" : "transparent",
              }}
              onClick={() => navigate(action.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <ActionIcon
                size="lg"
                radius="md"
                variant="light"
                color="violet"
                aria-label={action.label}
                style={{ borderColor: palette.accent }}
              >
                {action.icon}
              </ActionIcon>
              <Text fw={600} size="sm" c={palette.textMain} style={{ whiteSpace: "nowrap" }}>
                {action.label}
              </Text>
            </Group>
          ))}
        </Group>
      )}
    </Paper>
  );
}
