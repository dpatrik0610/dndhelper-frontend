import {
  Group, Text, ThemeIcon, Tooltip, ActionIcon, Divider,
  Box, Badge, Stack
} from "@mantine/core";
import {
  IconArchive, IconReload, IconPlus, IconBox,
  IconUsersGroup, IconUserCog
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useAdminInventoryStore } from "../../../../../store/admin/useAdminInventoryStore";
import { useAdminCurrencyStore } from "../../../../../store/admin/useAdminCurrencyStore";
import { useAdminCharacterStore } from "../../../../../store/admin/useAdminCharacterStore";
import { ItemModal } from "../InventoryItems/ItemModal";
import { AddExistingItemModal } from "./AddExistingItemModal";
import { SelectInventoryOwnersModal } from "./SelectInventoryOwnersModal";
import type { Character } from "../../../../../types/Character/Character";

export function InventoryHeader() {
  const { selected, refreshSelected } = useAdminInventoryStore();
  const { loadInventoryById } = useAdminCurrencyStore();
  const { characters } = useAdminCharacterStore();

  const [addModal, setAddModal] = useState(false);
  const [existingModal, setExistingModal] = useState(false);
  const [ownerModal, setOwnerModal] = useState(false);

  const invName = selected?.name || "Unnamed Inventory";
  const [owners, setOwners] = useState<Pick<Character, "id" | "name" | "ownerId" | "inventoryIds">[] | []>([]);

  
  useEffect(() => {
    if (selected?.id) void loadInventoryById(selected.id);
  }, [selected?.id, loadInventoryById]);
  
  useEffect(() => {
    if (!selected) return;

    const filtered = characters.filter(x => selected!.characterIds?.includes(x.id!))
    setOwners(filtered);
  }, [selected, setOwners, characters])

  if (!selected) return null;


  return (
    <>
      <Box mb="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={2}>
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

            {owners.length > 0 && (
              <Group gap={4} wrap="wrap" align="center">
                <IconUsersGroup size={14} color="rgba(180,255,255,0.8)" />
                {owners.map(({ id, name }) => (
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
          </Stack>

          <Group gap="xs">
            <Tooltip label="Reload Inventory" withArrow>
              <ActionIcon variant="subtle" color="cyan" radius="xl" onClick={refreshSelected}>
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

        <Divider my="sm" color="rgba(255,255,255,0.1)" style={{ borderTopWidth: 1 }} />
      </Box>

      <AddExistingItemModal opened={existingModal} onClose={() => setExistingModal(false)} />
      <ItemModal opened={addModal} onClose={() => setAddModal(false)} editMode={false} />
      <SelectInventoryOwnersModal opened={ownerModal} onClose={() => setOwnerModal(false)} />
    </>
  );
}
