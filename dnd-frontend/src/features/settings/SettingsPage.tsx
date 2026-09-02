import {
  Box,
  Title,
  Text,
  Grid,
  Group,
  Stack,
  Paper,
  Center,
  Loader,
} from "@mantine/core";
import {
  IconCheck,
  IconPalette,
} from "@tabler/icons-react";
import { useUiStore } from "@store/ui/uiStore";
import { useIsMobile } from "@hooks/useIsMobile";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { type SidebarThemeVariant } from "@features/navigation/Sidebar/sidebarThemes";

interface ThemeOption {
  key: SidebarThemeVariant;
  name: string;
  icon: string;
  accent: string;
  accentSecondary: string;
  glow: string;
}

const THEMES: ThemeOption[] = [
  {
    key: "midnight",
    name: "Midnight",
    icon: "🌌",
    accent: "#a855f7",
    accentSecondary: "#06b6d4",
    glow: "0 0 15px rgba(168, 85, 247, 0.3)",
  },
  {
    key: "sunset",
    name: "Cyber-Fantasy",
    icon: "💛",
    accent: "#f59e0b",
    accentSecondary: "#10b981",
    glow: "0 0 15px rgba(245, 158, 11, 0.25)",
  },
  {
    key: "crimson-vampire",
    name: "Crimson Dynasty",
    icon: "🩸",
    accent: "#ef4444",
    accentSecondary: "#d97706",
    glow: "0 0 15px rgba(239, 68, 68, 0.3)",
  },
  {
    key: "frost-glacier",
    name: "Frost Glacier",
    icon: "❄️",
    accent: "#38bdf8",
    accentSecondary: "#cbd5e1",
    glow: "0 0 15px rgba(56, 189, 248, 0.25)",
  },
];

export default function SettingsPage() {
  const isMobile = useIsMobile();
  const {
    sidebarTheme,
    setSidebarTheme,
    loadingSettings,
  } = useUiStore();

  const handleSelectTheme = (themeKey: SidebarThemeVariant) => {
    try {
      setSidebarTheme(themeKey);
      showNotification({
        title: "Theme Updated",
        message: `Successfully aligned with the forces of ${THEMES.find(t => t.key === themeKey)?.name}.`,
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({
        title: "Error updating theme",
        message: String(err),
        color: SectionColor.Red,
      });
    }
  };

  if (loadingSettings) {
    return (
      <Center style={{ height: "60vh" }}>
        <Loader size="lg" color="indigo" />
      </Center>
    );
  }

  return (
    <Box
      m={isMobile ? 0 : "0 auto"}
      maw={isMobile ? "100%" : 900}
      w={isMobile ? "100%" : undefined}
      p={isMobile ? "xs" : "md"}
    >
      <Stack gap="xl">
        {/* Page Header */}
        <Box>
          <Title
            order={2}
            style={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontWeight: 700,
              letterSpacing: "1px",
              color: "var(--theme-color-text-primary, #fff)",
            }}
          >
            Settings
          </Title>
          <Text c="dimmed" size="sm" mt="xs">
            Manage your visual themes and other system preferences.
          </Text>
        </Box>

        {/* Theme Settings Panel */}
        <Paper
          p={isMobile ? "md" : "lg"}
          style={{
            background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
            borderRadius: isMobile ? 0 : 20,
            backdropFilter: "blur(24px) saturate(130%)",
            WebkitBackdropFilter: "blur(24px) saturate(130%)",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
          }}
        >
          <Stack gap="md">
            <Group gap="xs" align="center">
              <IconPalette size={20} color="var(--theme-color-accent-primary, #f59e0b)" />
              <Text
                fw={600}
                size="md"
                tt="uppercase"
                style={{
                  letterSpacing: "2px",
                  color: "var(--theme-color-text-primary, #fff)",
                }}
              >
                Visual Themes
              </Text>
            </Group>
            

            <Grid gutter="md" mt="xs">
              {THEMES.map((theme) => {
                const isActive = sidebarTheme === theme.key;
                return (
                  <Grid.Col span={{ base: 12, sm: 6 }} key={theme.key}>
                    <Paper
                      p="md"
                      onClick={() => handleSelectTheme(theme.key)}
                      style={{
                        cursor: "pointer",
                        background: "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
                        border: `1px solid ${isActive ? "var(--theme-border-glow, rgba(255, 255, 255, 0.15))" : "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))"}`,
                        borderRadius: 12,
                        boxShadow: isActive ? "var(--theme-glow-shadow-primary)" : "none",
                        transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                        transform: isActive ? "scale(1.01)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.15))";
                        e.currentTarget.style.boxShadow = "var(--theme-glow-shadow-primary)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isActive
                          ? "var(--theme-border-glow, rgba(255, 255, 255, 0.15))"
                          : "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
                        e.currentTarget.style.boxShadow = isActive ? "var(--theme-glow-shadow-primary)" : "none";
                        e.currentTarget.style.transform = isActive ? "scale(1.01)" : "none";
                      }}
                    >
                      <Group justify="space-between" align="center" mb="xs">
                        <Group gap="xs">
                          <Text size="lg">{theme.icon}</Text>
                          <Text fw={600} size="sm" style={{ color: "var(--theme-color-text-primary, #fff)" }}>
                            {theme.name}
                          </Text>
                        </Group>
                        {isActive && (
                          <Paper
                            px="xs"
                            py={2}
                            style={{
                              background: "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.08))",
                              border: "1px solid var(--theme-border-glow, rgba(255, 255, 255, 0.15))",
                              borderRadius: 20,
                            }}
                          >
                            <Group gap={4} align="center">
                              <IconCheck size={12} color="var(--theme-color-accent-primary, #f59e0b)" />
                              <Text fw={600} size="xs" c="var(--theme-color-accent-primary, #f59e0b)">
                                ACTIVE
                              </Text>
                            </Group>
                          </Paper>
                        )}
                      </Group>

                      {/* Accent Previews */}
                      <Group gap="xs">
                        <Box
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: theme.accent,
                            boxShadow: `0 0 8px ${theme.accent}`,
                          }}
                        />
                        <Box
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: theme.accentSecondary,
                            boxShadow: `0 0 8px ${theme.accentSecondary}`,
                          }}
                        />
                        <Text size="10px" c="dimmed" tt="uppercase" lts={1}>
                          Palette Spectrum
                        </Text>
                      </Group>
                    </Paper>
                  </Grid.Col>
                );
              })}
            </Grid>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
