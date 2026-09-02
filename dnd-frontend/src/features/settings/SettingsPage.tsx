import { useState, useEffect } from "react";
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
  TextInput,
  Button,
  Avatar,
  Badge,
} from "@mantine/core";
import {
  IconCheck,
  IconPalette,
  IconUserCircle,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useUiStore } from "@store/ui/uiStore";
import { useIsMobile } from "@hooks/useIsMobile";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { type SidebarThemeVariant } from "@features/navigation/Sidebar/sidebarThemes";
import {
  useCharacterList,
  useCurrentCharacter,
  useCharacterCoreActions,
} from "@store/character/characterSelectors";
import { updateCharacter as updateCharacterApi } from "@services/characterService";
import type { Character } from "@appTypes/Character/Character";

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
  {
    key: "feywild",
    name: "Feywild Bloom",
    icon: "🌸",
    accent: "#f472b6",
    accentSecondary: "#fbbf24",
    glow: "0 0 15px rgba(244, 114, 182, 0.25)",
  },
  {
    key: "toxic",
    name: "Toxic Spore",
    icon: "🧪",
    accent: "#22c55e",
    accentSecondary: "#facc15",
    glow: "0 0 15px rgba(34, 197, 94, 0.25)",
  },
  {
    key: "void",
    name: "Eldritch Void",
    icon: "👁️",
    accent: "#d946ef",
    accentSecondary: "#6366f1",
    glow: "0 0 15px rgba(217, 70, 239, 0.25)",
  },
  {
    key: "steampunk",
    name: "Clockwork Brass",
    icon: "⚙️",
    accent: "#ea580c",
    accentSecondary: "#0d9488",
    glow: "0 0 15px rgba(234, 88, 12, 0.25)",
  },
  {
    key: "deep-ocean",
    name: "Deep Ocean",
    icon: "🌊",
    accent: "#0284c7",
    accentSecondary: "#0d9488",
    glow: "0 0 15px rgba(2, 132, 199, 0.25)",
  },
  {
    key: "darkvision",
    name: "Darkvision",
    icon: "🕶️",
    accent: "#ffffff",
    accentSecondary: "#9ca3af",
    glow: "0 0 15px rgba(255, 255, 255, 0.25)",
  },
];

type SettingsSection = "appearance" | "tokens";

export default function SettingsPage() {
  const isMobile = useIsMobile();
  const { sidebarTheme, setSidebarTheme, loadingSettings } = useUiStore();
  const characters = useCharacterList();
  const character = useCurrentCharacter();
  const { setCharacters, setCharacter } = useCharacterCoreActions();

  const [activeTab, setActiveTab] = useState<SettingsSection>("appearance");
  const [draftUrls, setDraftUrls] = useState<Record<string, string>>({});
  const [savingCharId, setSavingCharId] = useState<string | null>(null);

  // Sync draft URLs from characters list
  useEffect(() => {
    const initial: Record<string, string> = {};
    characters.forEach((char) => {
      if (char.id) {
        initial[char.id] = char.imageUrl ?? "";
      }
    });
    setDraftUrls((prev) => ({ ...initial, ...prev }));
  }, [characters]);

  const handleSelectTheme = (themeKey: SidebarThemeVariant) => {
    try {
      setSidebarTheme(themeKey);
      showNotification({
        title: "Theme Updated",
        message: `Successfully aligned with the forces of ${THEMES.find((t) => t.key === themeKey)?.name}.`,
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

  const handleUrlChange = (charId: string, value: string) => {
    setDraftUrls((prev) => ({ ...prev, [charId]: value }));
  };

  const handleSaveImageUrl = async (char: Character) => {
    if (!char.id) return;
    setSavingCharId(char.id);
    try {
      const draftUrl = draftUrls[char.id] ?? "";
      const updatedCharacter = { ...char, imageUrl: draftUrl.trim() };
      const saved = await updateCharacterApi(updatedCharacter);
      
      if (saved) {
        // Update characters list in store
        const nextList = characters.map((c) => (c.id === saved.id ? saved : c));
        setCharacters(nextList);

        // Update currently active character if matches
        if (character && character.id === saved.id) {
          setCharacter(saved);
        }

        showNotification({
          title: "Token URL Saved",
          message: `Successfully updated token image for ${char.name}.`,
          color: SectionColor.Green,
        });
      } else {
        throw new Error("Save returned invalid character data.");
      }
    } catch (err) {
      console.error(err);
      showNotification({
        title: "Failed to Save Token",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setSavingCharId(null);
    }
  };

  if (loadingSettings) {
    return (
      <Center style={{ height: "60vh" }}>
        <Loader size="lg" color="indigo" />
      </Center>
    );
  }

  const SECTIONS = [
    { id: "appearance", label: "Visual Themes", icon: <IconPalette size={18} /> },
    { id: "tokens", label: "Character Tokens", icon: <IconUserCircle size={18} /> },
  ] as const;

  return (
    <Box
      m="0 auto"
      maw="100%"
      w="100%"
      p={isMobile ? "xs" : "xl"}
      style={{
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      }}
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
            Manage your visual themes, character token assets, and interface preferences.
          </Text>
        </Box>

        {/* Layout Grid */}
        <Grid gutter="xl">
          {/* Sidebar (Desktop) / Horizontal navigation (Mobile) */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            {isMobile ? (
              <Group
                wrap="nowrap"
                style={{
                  overflowX: "auto",
                  paddingBottom: "8px",
                  borderBottom: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                gap="sm"
              >
                {SECTIONS.map((sec) => {
                  const isActive = activeTab === sec.id;
                  return (
                    <Button
                      key={sec.id}
                      onClick={() => setActiveTab(sec.id)}
                      variant="subtle"
                      size="sm"
                      leftSection={sec.icon}
                      style={{
                        flexShrink: 0,
                        background: isActive
                          ? "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.08))"
                          : "transparent",
                        border: `1px solid ${isActive ? "var(--theme-border-glow, rgba(255, 255, 255, 0.15))" : "transparent"}`,
                        color: isActive
                          ? "#121214"
                          : "var(--theme-color-text-secondary, rgba(255,255,255,0.7))",
                        borderRadius: "8px",
                        fontWeight: isActive ? 700 : 500,
                        transition: "all 0.2s ease",
                      }}
                    >
                      {sec.label}
                    </Button>
                  );
                })}
              </Group>
            ) : (
              <Stack gap="sm">
                {SECTIONS.map((sec) => {
                  const isActive = activeTab === sec.id;
                  return (
                    <Button
                      key={sec.id}
                      onClick={() => setActiveTab(sec.id)}
                      variant="subtle"
                      justify="flex-start"
                      size="md"
                      leftSection={sec.icon}
                      fullWidth
                      style={{
                        height: "48px",
                        background: isActive
                          ? "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.06))"
                          : "transparent",
                        border: "1px solid",
                        borderColor: isActive
                          ? "var(--theme-border-glow, rgba(255, 255, 255, 0.15))"
                          : "transparent",
                        color: isActive
                          ? "#121214"
                          : "var(--theme-color-text-secondary, rgba(255,255,255,0.7))",
                        borderRadius: "10px",
                        fontWeight: isActive ? 700 : 500,
                        boxShadow: isActive ? "var(--theme-glow-shadow-primary)" : "none",
                        transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "var(--theme-bg-card, rgba(255,255,255,0.015))";
                          e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255,255,255,0.06))";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }
                      }}
                    >
                      {sec.label}
                    </Button>
                  );
                })}
              </Stack>
            )}
          </Grid.Col>

          {/* Content Pane */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Paper
              p={isMobile ? "md" : "xl"}
              style={{
                background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.45))",
                border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                borderRadius: isMobile ? 12 : 20,
                backdropFilter: "blur(24px) saturate(130%)",
                WebkitBackdropFilter: "blur(24px) saturate(130%)",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 20px 50px rgba(0, 0, 0, 0.35), var(--theme-glow-shadow-primary)",
              }}
            >
              {activeTab === "appearance" ? (
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
                  <Text size="xs" c="dimmed">
                    Align your character sheet with the cosmic energies of your campaign theme.
                  </Text>

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
              ) : (
                <Stack gap="md">
                  <Group gap="xs" align="center">
                    <IconUserCircle size={20} color="var(--theme-color-accent-primary, #f59e0b)" />
                    <Text
                      fw={600}
                      size="md"
                      tt="uppercase"
                      style={{
                        letterSpacing: "2px",
                        color: "var(--theme-color-text-primary, #fff)",
                      }}
                    >
                      Character Tokens
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    Assign custom artwork URLs to represent your heroes on character lists, headers, and encounter maps.
                  </Text>

                  {characters.length === 0 ? (
                    <Center py="xl">
                      <Paper
                        p="lg"
                        style={{
                          background: "var(--theme-bg-card, rgba(255,255,255,0.015))",
                          border: "1px solid var(--theme-border-subtle, rgba(255,255,255,0.06))",
                          borderRadius: "12px",
                        }}
                      >
                        <Text size="sm" c="dimmed" fs="italic">
                          No characters found. Create an adventurer first to configure their token artwork.
                        </Text>
                      </Paper>
                    </Center>
                  ) : (
                    <Stack gap="sm" mt="xs">
                      {characters.map((char) => {
                        if (!char.id) return null;
                        const isSaving = savingCharId === char.id;
                        const imageUrl = draftUrls[char.id] ?? "";
                        const isCurrentUser = character?.id === char.id;

                        return (
                          <Paper
                            key={char.id}
                            p="md"
                            style={{
                              background: "var(--theme-bg-card, rgba(255, 255, 255, 0.015))",
                              border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.06))",
                              borderRadius: 12,
                              transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(255, 255, 255, 0.12))";
                              e.currentTarget.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.06))";
                              e.currentTarget.style.transform = "none";
                            }}
                          >
                            <Grid gutter="md" align="center">
                              {/* Character Avatar & Info */}
                              <Grid.Col span={{ base: 12, sm: 5 }}>
                                <Group gap="md" wrap="nowrap">
                                  <Avatar
                                    src={imageUrl || undefined}
                                    size={72}
                                    radius="md"
                                    style={{
                                      border: `2px solid ${isCurrentUser ? "var(--theme-color-accent-primary, #f59e0b)" : "var(--theme-border-subtle, rgba(255,255,255,0.15))"}`,
                                      background: imageUrl ? "transparent" : "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
                                      boxShadow: isCurrentUser ? "var(--theme-glow-shadow-primary)" : "none",
                                      fontWeight: 800,
                                      color: "#fff",
                                    }}
                                  >
                                    {char.name.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                                    <Group gap="xs" wrap="nowrap">
                                      <Text
                                        fw={700}
                                        size="sm"
                                        truncate
                                        style={{ color: "var(--theme-color-text-primary, #fff)" }}
                                      >
                                        {char.name}
                                      </Text>
                                      {isCurrentUser && (
                                        <Badge size="xs" color="violet" variant="light">
                                          ACTIVE
                                        </Badge>
                                      )}
                                    </Group>
                                    <Text size="xs" c="dimmed" truncate>
                                      Lvl {char.level} • {char.race} • {char.characterClass}
                                    </Text>
                                  </Stack>
                                </Group>
                              </Grid.Col>

                              {/* Input URL field & Save Button */}
                              <Grid.Col span={{ base: 12, sm: 7 }}>
                                <Group gap="xs" wrap="nowrap" align="center">
                                  <TextInput
                                    placeholder="Image or Token URL (https://...)"
                                    value={imageUrl}
                                    onChange={(e) => handleUrlChange(char.id!, e.currentTarget.value)}
                                    style={{ flex: 1 }}
                                    styles={{
                                      input: {
                                        background: "rgba(0, 0, 0, 0.25)",
                                        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                                        color: "var(--theme-color-text-primary, #fff)",
                                        borderRadius: "8px",
                                        height: "36px",
                                        fontSize: "13px",
                                        "&:focus": {
                                          borderColor: "var(--theme-border-glow, rgba(255, 255, 255, 0.2))",
                                        },
                                      },
                                    }}
                                  />
                                  <Button
                                    size="xs"
                                    onClick={() => handleSaveImageUrl(char)}
                                    loading={isSaving}
                                    leftSection={<IconDeviceFloppy size={14} />}
                                    style={{
                                      height: "36px",
                                      borderRadius: "8px",
                                      background: "var(--theme-gradient-primary, linear-gradient(135deg, #f59e0b, #10b981))",
                                      border: "none",
                                      color: "#fff",
                                      boxShadow: "var(--theme-glow-shadow-primary)",
                                      fontWeight: 600,
                                      flexShrink: 0,
                                    }}
                                  >
                                    Save
                                  </Button>
                                </Group>
                              </Grid.Col>
                            </Grid>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                </Stack>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Box>
  );
}
