import {
  Box,
  Group,
  Text,
  ThemeIcon,
  Tooltip,
  ActionIcon,
  Divider,
  Stack,
  Badge,
} from "@mantine/core";
import {
  IconFlag,
  IconReload,
  IconPencil,
  IconTrash,
  IconUsersGroup,
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
} from "@tabler/icons-react";

import { useState } from "react";
import { useAdminCampaignStore } from "@store/admin/useAdminCampaignStore";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";

export function CampaignHeader() {
  const {
    selectedCampaign,
    reload,
    update,
    remove,
  } = useAdminCampaignStore();

  const campaign = selectedCampaign();
  const [updating, setUpdating] = useState(false);

  if (!campaign) return null;

  const handleDelete = async () => {
    await remove(campaign.id!);
  };

  const handleRename = async () => {
    const name = prompt("Enter new campaign name:", campaign.name);
    if (!name || name.trim() === "" || name === campaign.name) return;
    await update(campaign.id!, { ...campaign, name });
  };

  const toggleActive = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      await update(campaign.id!, { ...campaign, isActive: !campaign.isActive });
      showNotification({
        title: "Campaign updated",
        message: `${campaign.name} is now ${!campaign.isActive ? "active" : "inactive"}.`,
        color: SectionColor.Green,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box mb="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        {/* === LEFT SIDE === */}
        <Stack gap={2}>
          <Group gap="sm" align="center">
            <ThemeIcon
              variant="gradient"
              gradient={{ from: "grape", to: "violet" }}
              radius="xl"
              size="lg"
            >
              <IconFlag size={18} />
            </ThemeIcon>

            <Text fw={600} size="lg" c="violet.2">
              {campaign.name || "Unnamed Campaign"}
            </Text>

            <Badge
              variant="filled"
              color={campaign.isActive ? "green" : "gray"}
              size="sm"
              radius="sm"
            >
              {campaign.isActive ? "Active" : "Inactive"}
            </Badge>
          </Group>

          {/* Owner list */}
          {campaign.ownerIds && campaign.ownerIds.length > 0 && (
            <Group gap={4} wrap="wrap">
              <IconUsersGroup size={14} color="rgba(200,200,255,0.7)" />
              {campaign.ownerIds.map((id) => (
                <Badge
                  key={id}
                  color="violet"
                  variant="light"
                  radius="sm"
                  size="sm"
                  styles={{
                    root: {
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(220,200,255,0.9)",
                      textTransform: "none",
                    },
                  }}
                >
                  {id.length > 12 ? `${id.slice(0, 12)}…` : id}
                </Badge>
              ))}
            </Group>
          )}

          <Text size="xs" c="dimmed">
            Created:{" "}
            {campaign.createdAt
              ? new Date(campaign.createdAt).toLocaleString()
              : "Unknown"}
          </Text>
        </Stack>

        {/* === RIGHT SIDE === */}
        <Group gap="xs">
          <Tooltip label="Reload" withArrow>
            <ActionIcon
              variant="subtle"
              color="violet"
              radius="xl"
              onClick={reload}
            >
              <IconReload size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip
            label={campaign.isActive ? "Set Inactive" : "Set Active"}
            withArrow
          >
            <ActionIcon
              variant="gradient"
              gradient={
                campaign.isActive
                  ? { from: "gray", to: "dark" }
                  : { from: "green", to: "teal" }
              }
              radius="xl"
              onClick={toggleActive}
              loading={updating}
            >
              {campaign.isActive ? (
                <IconPlayerPauseFilled size={18} />
              ) : (
                <IconPlayerPlayFilled size={18} />
              )}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Rename Campaign" withArrow>
            <ActionIcon
              variant="gradient"
              gradient={{ from: "blue", to: "violet" }}
              radius="xl"
              onClick={handleRename}
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete Campaign" withArrow>
            <ActionIcon
              variant="gradient"
              gradient={{ from: "red", to: "pink" }}
              radius="xl"
              onClick={handleDelete}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Divider
        my="sm"
        color="rgba(255,255,255,0.1)"
        style={{ borderTopWidth: 1 }}
      />
    </Box>
  );
}


