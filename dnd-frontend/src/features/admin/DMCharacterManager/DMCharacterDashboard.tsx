import { useEffect, useState, useMemo } from "react";
import { Box, TextInput, Group, ActionIcon, ScrollArea, Stack, ThemeIcon, Text, Loader, Tooltip } from "@mantine/core";
import { IconSearch, IconX, IconUsers, IconMoon } from "@tabler/icons-react";
import { useAdminCharacterStore } from "@store/admin/adminCharacterStore";
import { useAdminCampaignStore } from "@store/admin/adminCampaignStore";
import { DMCharacterCard } from "./components/DMCharacterCard";
import { DMCharacterWorkspace } from "./components/Workspace/DMCharacterWorkspace";
import styles from "./DMCharacterDashboard.module.css";

export function DMCharacterDashboard() {
  const { selectedId: campaignId } = useAdminCampaignStore();
  const { characters, loadAll, loading, updateCharacter, longRestCharacter, bulkLongRest } = useAdminCharacterStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  useEffect(() => {
    if (campaignId) {
      void loadAll(campaignId);
    }
  }, [campaignId, loadAll]);

  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return characters;
    return characters.filter(char =>
      char.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [characters, searchQuery]);

  const playerCharacters = useMemo(() => filteredCharacters.filter(c => !c.isNPC), [filteredCharacters]);
  const npcCharacters = useMemo(() => filteredCharacters.filter(c => c.isNPC), [filteredCharacters]);

  const handleGroupLongRest = () => {
    void bulkLongRest(playerCharacters.map(c => c.id!));
  };

  const activeCharacter = useMemo(() => {
    return characters.find(c => c.id === selectedCharacterId) || null;
  }, [characters, selectedCharacterId]);

  return (
    <div className={styles.dashboardRoot}>
      <div className={styles.splitLayout}>
        {/* Workspace Area - Moved to the left */}
        <div className={styles.workspaceArea}>
          {activeCharacter ? (
            <DMCharacterWorkspace
              character={activeCharacter}
              onClose={() => setSelectedCharacterId(null)}
            />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateInner}>
                <IconUsers size={36} color="#818cf8" stroke={1.3} />
                <Text size="sm" c="dimmed" maw={280}>
                  Select a character from the sidebar to view their details.
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Moved to the right */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Group gap="xs" mb="sm" justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="light" color="grape" size="md" radius="sm">
                  <IconUsers size={16} />
                </ThemeIcon>
                <div>
                  <Text fw={700} size="sm" c="white">Characters</Text>
                  <Text size="xs" c="dimmed">{filteredCharacters.length} shown</Text>
                </div>
              </Group>

              <Tooltip label="Long Rest (All Players)">
                <ActionIcon variant="light" color="indigo" onClick={handleGroupLongRest}>
                  <IconMoon size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <TextInput
              placeholder="Search characters..."
              leftSection={<IconSearch size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              rightSection={
                searchQuery ? (
                  <ActionIcon onClick={() => setSearchQuery("")} variant="transparent" size="sm">
                    <IconX size={14} />
                  </ActionIcon>
                ) : null
              }
              size="xs"
              styles={{
                input: {
                  backgroundColor: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.06)",
                },
              }}
            />
          </div>

          <ScrollArea className={styles.sidebarScroll} offsetScrollbars>
            {loading && filteredCharacters.length === 0 ? (
              <Group justify="center" py="xl">
                <Loader color="grape" size="sm" />
              </Group>
            ) : filteredCharacters.length === 0 ? (
              <Stack align="center" py="xl" gap="xs">
                <IconUsers size={22} color="gray" />
                <Text c="dimmed" size="xs">No characters found.</Text>
              </Stack>
            ) : (
              <Stack gap="lg" pb="md">
                {playerCharacters.length > 0 && (
                  <Box>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" ml="xs">Player Characters</Text>
                    <Stack gap="sm">
                      {playerCharacters.map((char) => (
                        <Box
                          key={char.id}
                          style={{
                            border: selectedCharacterId === char.id ? "1px solid rgba(129, 140, 248, 0.5)" : "1px solid transparent",
                            borderRadius: "var(--mantine-radius-md)",
                            transition: "border-color 0.2s ease"
                          }}
                        >
                          <DMCharacterCard
                            character={char}
                            onOpenWorkspace={() => setSelectedCharacterId(char.id!)}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {npcCharacters.length > 0 && (
                  <Box>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs" ml="xs">NPCs & DM's Characters</Text>
                    <Stack gap="sm">
                      {npcCharacters.map((char) => (
                        <Box
                          key={char.id}
                          style={{
                            border: selectedCharacterId === char.id ? "1px solid rgba(129, 140, 248, 0.5)" : "1px solid transparent",
                            borderRadius: "var(--mantine-radius-md)",
                            transition: "border-color 0.2s ease"
                          }}
                        >
                          <DMCharacterCard
                            character={char}
                            onOpenWorkspace={() => setSelectedCharacterId(char.id!)}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
