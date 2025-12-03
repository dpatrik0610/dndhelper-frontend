import {
  Group,
  Text,
  ThemeIcon,
  Tooltip,
  ActionIcon,
  Divider,
  Box,
  Badge,
  Stack,
} from "@mantine/core";
import {
  IconArchive,
  IconReload,
  IconPlus,
  IconBox,
  IconUsersGroup,
  IconUserCog,
  IconLink,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAdminInventoryStore } from "../../../../../store/admin/useAdminInventoryStore";
import { useAdminCurrencyStore } from "../../../../../store/admin/useAdminCurrencyStore";
import { useAdminCharacterStore } from "../../../../../store/admin/useAdminCharacterStore";
import { useAuthStore } from "../../../../../store/useAuthStore";
import { getCharacterById, updateCharacter } from "../../../../../services/characterService";
import { showNotification } from "../../../../../components/Notification/Notification";
import { SectionColor } from "../../../../../types/SectionColor";
import { ItemModal } from "../InventoryItems/ItemModal";
import { AddExistingItemModal } from "./AddExistingItemModal";
import { SelectInventoryOwnersModal } from "./SelectInventoryOwnersModal";

interface CharacterOwnerView {
  id: string;
  name: string;
  ownerIds: string[];
}

export function InventoryHeader() {
  const { selected, refreshSelected } = useAdminInventoryStore();
  const { loadInventoryById } = useAdminCurrencyStore();
  const { characters } = useAdminCharacterStore();
  const token = useAuthStore.getState().token!;

  const [addModal, setAddModal] = useState(false);
  const [existingModal, setExistingModal] = useState(false);
  const [ownerModal, setOwnerModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const invName = selected?.name || "Unnamed Inventory";

  // Characters linked to this inventory
  const [ownerCharacters, setOwnerCharacters] = useState<CharacterOwnerView[]>(
    []
  );

  // Player IDs (users) owning those characters
  const [ownerUserIds, setOwnerUserIds] = useState<string[]>([]);

  // Keep currency store in sync when inventory changes
  useEffect(() => {
    if (selected?.id) {
      void loadInventoryById(selected.id);
    }
  }, [selected?.id, loadInventoryById]);

  // Derive characters + player IDs that "own" this inventory
  useEffect(() => {
    if (!selected) {
      setOwnerCharacters([]);
      setOwnerUserIds([]);
      return;
    }

    // Characters that reference this inventory via characterIds
    const chars = characters.filter((c) =>
      selected.characterIds?.includes(c.id!)
    );

    setOwnerCharacters(
      chars.map((c) => ({
        id: c.id!,
        name: c.name,
        ownerIds: c.ownerIds ?? [],
      }))
    );

    // Collect all userIds from those character.ownerIds
    const userIdSet = new Set<string>();
    chars.forEach((c) => {
      (c.ownerIds ?? []).forEach((uid) => userIdSet.add(uid));
    });

    setOwnerUserIds([...userIdSet]);
  }, [selected, characters]);

  const handleSyncLinks = async () => {
    if (!selected?.id) return;
    const invId = selected.id;
    const ownerIds = selected.characterIds ?? [];
    if (ownerIds.length === 0) {
      showNotification({
        title: "No owners to sync",
        message: "This inventory has no character owners to sync.",
        color: SectionColor.Yellow,
      });
      return;
    }

    const owners = characters.filter((c) => ownerIds.includes(c.id!));
    const targets = owners.filter((c) => !(c.inventoryIds ?? []).includes(invId));
    if (targets.length === 0) {
      showNotification({
        title: "Already in sync",
        message: "All owner characters already reference this inventory.",
        color: SectionColor.Green,
      });
      return;
    }

    setSyncing(true);
    try {
      await Promise.all(
        targets.map(async (c) => {
          const fullCharacter = await getCharacterById(c.id!, token);
          if (!fullCharacter) return;
          const mergedIds = Array.from(new Set([...(fullCharacter.inventoryIds ?? []), invId]));
          return updateCharacter(
            {
              ...fullCharacter,
              inventoryIds: mergedIds,
            },
            token
          );
        })
      );
      showNotification({
        title: "Synced",
        message: `Added inventory to ${targets.length} character(s).`,
        color: SectionColor.Green,
      });
    } catch (err) {
      showNotification({
        title: "Sync failed",
        message: String(err),
        color: SectionColor.Red,
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!selected) return null;

  return (
    <>
      <Box mb="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            {/* === Title + Manage Owners === */}
            <Group gap="sm">
              <ThemeIcon
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan" }}
                radius="xl"
                size="lg"
              >
                <IconArchive size={18} />
              </ThemeIcon>

              <Text fw={600} size="lg" c="cyan.2">
                {invName}
              </Text>

              <Tooltip label="Manage Owners" withArrow>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="cyan"
                  onClick={() => setOwnerModal(true)}
                >
                  <IconUserCog size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {/* === Character owners (characters this inventory belongs to) === */}
            {ownerCharacters.length > 0 && (
              <Group gap={4} wrap="wrap" align="center">
                <IconUsersGroup size={14} color="rgba(180,255,255,0.8)" />
                {ownerCharacters.map(({ id, name }) => (
                  <Badge
                    key={id}
                    color="cyan"
                    variant="light"
                    radius="sm"
                    size="sm"
                    styles={{
                      root: {
                        background: "rgba(0,255,255,0.05)",
                        border: "1px solid rgba(0,255,255,0.2)",
                        color: "rgba(200,255,255,0.9)",
                        textTransform: "none",
                      },
                    }}
                  >
                    {name.length > 15 ? `${name.slice(0, 15)}…` : name}
                  </Badge>
                ))}
              </Group>
            )}

            {/* === Player owners (user IDs owning those characters) === */}
            {ownerUserIds.length > 0 && (
              <Group gap={4} wrap="wrap" align="center">
                <IconUserCog size={14} color="rgba(255,230,180,0.9)" />
                {ownerUserIds.map((userId) => (
                  <Badge
                    key={userId}
                    color="yellow"
                    variant="light"
                    radius="sm"
                    size="sm"
                    styles={{
                      root: {
                        background: "rgba(255,255,200,0.06)",
                        border: "1px solid rgba(255,255,150,0.35)",
                        color: "rgba(255,245,200,0.95)",
                        textTransform: "none",
                      },
                    }}
                  >
                    {userId.length > 18
                      ? `${userId.slice(0, 18)}…`
                      : userId}
                  </Badge>
                ))}
              </Group>
            )}
          </Stack>

          {/* === Actions === */}
          <Group gap="xs">
            <Tooltip label="Sync inventory to owner characters" withArrow>
              <ActionIcon
                variant="subtle"
                color="teal"
                radius="xl"
                onClick={handleSyncLinks}
                loading={syncing}
              >
                <IconLink size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Reload Inventory" withArrow>
              <ActionIcon
                variant="subtle"
                color="cyan"
                radius="xl"
                onClick={refreshSelected}
              >
                <IconReload size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Add Existing Item" withArrow>
              <ActionIcon
                variant="gradient"
                gradient={{ from: "teal", to: "cyan" }}
                radius="xl"
                onClick={() => setExistingModal(true)}
              >
                <IconBox size={18} />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Add New Item" withArrow>
              <ActionIcon
                variant="gradient"
                gradient={{ from: "pink", to: "violet" }}
                radius="xl"
                onClick={() => setAddModal(true)}
              >
                <IconPlus size={18} />
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

      {/* === Modals === */}
      <AddExistingItemModal
        opened={existingModal}
        onClose={() => setExistingModal(false)}
      />
      <ItemModal
        opened={addModal}
        onClose={() => setAddModal(false)}
        editMode={false}
      />
      <SelectInventoryOwnersModal
        opened={ownerModal}
        onClose={() => setOwnerModal(false)}
      />
    </>
  );
}
