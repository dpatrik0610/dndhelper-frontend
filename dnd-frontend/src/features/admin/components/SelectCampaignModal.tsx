// components/Admin/SelectCampaignModal.tsx
import { useEffect } from "react";
import { Box, Group, Text, Loader, Paper, ScrollArea, SimpleGrid } from "@mantine/core";
import { IconMapPin, IconCheck } from "@tabler/icons-react";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import { BaseModal } from "@components/BaseModal";
import { SectionColor } from "@appTypes/SectionColor";

interface SelectCampaignModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SelectCampaignModal({ opened, onClose }: SelectCampaignModalProps) {
  const { campaigns, selectedId, reload, select, loading } = useAdminCampaignStore();

  useEffect(() => { 
      const reloadfn = async () => {await reload ()}
      if (opened) {
        reloadfn();
      } 
    }, [opened, reload]);

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Select Campaign"
      showSaveButton={false}
      showCancelButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      {loading ? (
        <Group justify="center" mt="md">
          <Loader color={SectionColor.Grape} />
        </Group>
      ) : !campaigns.length ? (
        <Text c="dimmed" ta="center">No campaigns found.</Text>
      ) : (
        <ScrollArea h={300} type="hover">
        <SimpleGrid cols={1} spacing="sm" verticalSpacing="xs">
          {campaigns.map((camp) => {
            const isSelected = camp.id === selectedId;
            return (
              <Paper
                key={camp.id}
                p="md"
                radius="md"
                withBorder
                onClick={() => { select(camp.id); onClose(); }}
                style={{
                  cursor: "pointer",
                  background: isSelected
                    ? "linear-gradient(135deg, rgba(255,80,120,0.25), rgba(255,0,100,0.15))"
                    : "rgba(255,255,255,0.03)",
                  border: isSelected
                    ? "1px solid var(--mantine-color-red-5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.25s ease",
                  boxShadow: isSelected ? "0 0 10px rgba(255,0,100,0.3)" : "none",
                }}
              >
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <IconMapPin
                      size={20}
                      color={isSelected ? "var(--mantine-color-red-5)" : "var(--mantine-color-gray-5)"}
                    />
                    <Box>
                      <Text fw={600} size="sm" c="gray.1">
                        {camp.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {camp.characterIds?.length ?? 0} players
                      </Text>
                    </Box>
                  </Group>

                  {isSelected && <IconCheck size={18} color="var(--mantine-color-red-5)" />}
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>
        </ScrollArea>
      )}
    </BaseModal>
  );
}


