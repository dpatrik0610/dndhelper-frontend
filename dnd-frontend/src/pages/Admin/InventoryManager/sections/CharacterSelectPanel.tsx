import {
  Box,
  Group,
  Text,
  Loader,
  ScrollArea,
  SimpleGrid,
  Paper,
  Title,
  Tooltip,
  ActionIcon,
  Transition,
} from "@mantine/core";
import { IconUser, IconReload, IconArrowBackUp } from "@tabler/icons-react";
import { useEffect } from "react";
import { useAdminCharacterStore } from "../../../../store/admin/useAdminCharacterStore";
import { useAdminInventoryStore } from "../../../../store/admin/useAdminInventoryStore";
import { useAdminCampaignStore } from "../../../../store/admin/useAdminCampaignStore";
import { ExpandableSection } from "../../../../components/ExpendableSection";
import { SectionColor } from "../../../../types/SectionColor";

export function CharacterSelectPanel() {
  const { characters, selectedId, loading, loadAll: loadAllCharacters, select } = useAdminCharacterStore();
  const { loadByCharacter } = useAdminInventoryStore();
  const { selectedId: campaignId } = useAdminCampaignStore();

  // --- Load characters for selected campaign ---
  useEffect(() => {
    if (!campaignId) return;
    if(!characters || characters.length == 0) loadAllCharacters(campaignId);

  }, [characters, campaignId, loadAllCharacters]);

  // --- Load inventories when a character is selected ---
  useEffect(() => {
    if (selectedId) loadByCharacter(selectedId);
  }, [selectedId, loadByCharacter]);

  if (loading)
    return (
      <Group justify="center" mt="xl">
        <Loader color="grape" size="lg" />
      </Group>
    );

  const selectedChar = characters.find((c) => c.id === selectedId);

  return (
    <Box>
      {selectedId ? (
        // --- Compact view when a character is selected ---
        <Transition mounted transition="fade-up" duration={250} timingFunction="ease">
          {(styles) => (
            <Box style={{ ...styles, marginBottom: "1rem" }}>
              <Group justify="space-between">
                <Group>
                  <IconUser size={24} color="var(--mantine-color-grape-4)" />
                  <Title order={3} c="grape.3">
                    {selectedChar?.name ?? "Unknown Character"}
                  </Title>
                </Group>
                <Tooltip label="Change character" color="dark" withArrow>
                  <ActionIcon
                    variant="gradient"
                    gradient={{ from: "grape", to: "violet", deg: 45 }}
                    onClick={() => select(null)}
                  >
                    <IconArrowBackUp size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Box>
          )}
        </Transition>
      ) : (
        // --- Character selection section ---
        <ExpandableSection
          title="Character Selection"
          color={SectionColor.Grape}
          icon={<IconUser size={20} />}
          defaultOpen
          transparent
        >
          <Box>
            <Group justify="space-between" mb="md">
              <Title order={4} c="grape.3">
                Select a Character
              </Title>
              <Tooltip label="Reload character list" color="dark" withArrow>
                <ActionIcon
                  variant="gradient"
                  gradient={{ from: "grape", to: "violet", deg: 45 }}
                  onClick={() => campaignId && loadAllCharacters(campaignId)}
                >
                  <IconReload size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {!characters.length ? (
              <Text c="dimmed" ta="center">
                No characters found for this campaign.
              </Text>
            ) : (
              <ScrollArea h={260} type="hover">
                <SimpleGrid
                  cols={{ base: 1, sm: 2, md: 3 }}
                  spacing="sm"
                  verticalSpacing="sm"
                >
                  {characters.map((ch) => (
                    <Paper
                      key={ch.id}
                      p="sm"
                      radius="md"
                      withBorder
                      onClick={() => select(ch.id ?? null)}
                      style={{
                        cursor: "pointer",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-2px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      <Group>
                        <IconUser size={20} color="var(--mantine-color-gray-5)" />
                        <Box>
                          <Text fw={600} size="sm" c="gray.1">
                            {ch.name}
                          </Text>
                          {ch.ownerId && (
                            <Text size="xs" c="dimmed">
                              Owner ID: {ch.ownerId.slice(0, 6)}...
                            </Text>
                          )}
                        </Box>
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>
              </ScrollArea>
            )}
          </Box>
        </ExpandableSection>
      )}
    </Box>
  );
}
