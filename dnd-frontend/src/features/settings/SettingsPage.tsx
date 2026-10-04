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
  TextInput,
  Button,
  Avatar,
  Badge,
} from "@mantine/core";
import { IconUserCircle, IconDeviceFloppy } from "@tabler/icons-react";
import { useIsMobile } from "@hooks/useIsMobile";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import {
  useCharacterList,
  useCurrentCharacter,
  useCharacterCoreActions,
} from "@store/character/characterSelectors";
import { updateCharacter as updateCharacterApi } from "@services/characterService";
import type { Character } from "@appTypes/Character/Character";

export default function SettingsPage() {
  const isMobile = useIsMobile();
  const characters = useCharacterList();
  const character = useCurrentCharacter();
  const { setCharacters, setCharacter } = useCharacterCoreActions();

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
            Manage your character token assets. The theme lives in the sidebar.
          </Text>
        </Box>

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
        </Paper>
      </Stack>
    </Box>
  );
}
