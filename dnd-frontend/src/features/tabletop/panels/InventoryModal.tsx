import { useEffect, useState } from "react";
import { ActionIcon, Badge, Center, Group, Loader, Modal, Stack, Text, TextInput, Tooltip, UnstyledButton } from "@mantine/core";
import { IconBackpack, IconSearch, IconSwords } from "@tabler/icons-react";
import { EquipmentModal } from "@features/inventory/components/EquipmentModal";
import { getEquipmentByIdsForUser } from "@services/equipmentService";
import { getInventoriesByCharacter } from "@services/inventoryService";
import { useIsMobile } from "@hooks/useIsMobile";
import type { Character } from "@appTypes/Character/Character";
import type { EquipmentUserResponse } from "@appTypes/Equipment/Equipment";
import type { Inventory } from "@appTypes/Inventory/Inventory";
import { weaponAction } from "./tableActions";

/** The character's inventories over the table. Weapons roll their attack from the list; any item opens its details. */
export function InventoryModal({
  opened,
  onClose,
  character,
  onRoll,
}: {
  opened: boolean;
  onClose: () => void;
  character: Character;
  onRoll: (expressions: string[], label?: string) => void;
}) {
  const isMobile = useIsMobile();
  const [inventories, setInventories] = useState<Inventory[] | null>(null);
  const [equipment, setEquipment] = useState(new Map<string, EquipmentUserResponse>());
  const [search, setSearch] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const characterId = character.id;

  // Loaded on every open, so loot and trades made elsewhere show up.
  useEffect(() => {
    if (!opened || !characterId) return;
    let cancelled = false;
    setInventories(null);

    (async () => {
      const list = await getInventoriesByCharacter(characterId).catch(() => []);
      const ids = [...new Set(list.flatMap((inv) => inv.items ?? []).map((item) => item.equipmentId).filter((id): id is string => !!id))];
      const details = ids.length ? await getEquipmentByIdsForUser(ids).catch(() => []) : [];
      if (cancelled) return;
      setEquipment(new Map(details.map((e) => [e.id, e])));
      setInventories(list);
    })();

    return () => {
      cancelled = true;
    };
  }, [opened, characterId]);

  const query = search.trim().toLowerCase();

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        size="lg"
        fullScreen={isMobile}
        classNames={{ content: "tt-solid", header: "tt-solid" }}
        title={
          <Group gap={8}>
            <IconBackpack size={18} />
            <Text fw={700}>{character.name}'s inventory</Text>
          </Group>
        }
      >
        {!inventories ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : inventories.length === 0 ? (
          <Text c="dimmed" ta="center" py="lg">
            This character has no inventories yet.
          </Text>
        ) : (
          <Stack gap="md">
            <TextInput
              size="xs"
              placeholder="Search items"
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              data-autofocus
            />
            {inventories.map((inv) => {
              const items = (inv.items ?? []).filter((item) => !query || (item.equipmentName ?? "").toLowerCase().includes(query));
              const money = (inv.currencies ?? []).filter((c) => c.amount > 0);
              return (
                <Stack key={inv.id} gap={6}>
                  <Group justify="space-between" gap="xs">
                    <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                      {inv.name || "Inventory"}
                    </Text>
                    <Group gap={4}>
                      {money.map((c) => (
                        <Badge key={c.currencyCode} size="xs" variant="light" color="yellow">
                          {c.amount} {c.currencyCode}
                        </Badge>
                      ))}
                    </Group>
                  </Group>
                  {items.length === 0 && (
                    <Text size="xs" c="dimmed">
                      {query ? "No matching items." : "Empty."}
                    </Text>
                  )}
                  {items.map((item, i) => {
                    const details = item.equipmentId ? equipment.get(item.equipmentId) : undefined;
                    const attack = details ? weaponAction(details, character) : null;
                    const subtitle = attack?.detail ?? item.note;
                    return (
                      <div key={item.equipmentId ?? i} className="tt-item">
                        <UnstyledButton
                          className="tt-item-main"
                          onClick={() => setDetailId(item.equipmentId ?? null)}
                          disabled={!item.equipmentId}
                        >
                          <Group gap={6} wrap="nowrap">
                            <Text size="sm" fw={600} truncate>
                              {item.equipmentName || details?.name || "Unnamed item"}
                            </Text>
                            {(item.quantity ?? 1) > 1 && (
                              <Badge size="xs" variant="light" color="gray">
                                ×{item.quantity}
                              </Badge>
                            )}
                          </Group>
                          {subtitle && (
                            <Text size="xs" c="dimmed" truncate>
                              {subtitle}
                            </Text>
                          )}
                        </UnstyledButton>
                        {attack && (
                          <Tooltip label="Roll attack">
                            <ActionIcon variant="light" color="violet" onClick={() => onRoll(attack.expressions, attack.name)} aria-label={`Roll ${attack.name} attack`}>
                              <IconSwords size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </Stack>
              );
            })}
          </Stack>
        )}
      </Modal>
      <EquipmentModal opened={!!detailId} onClose={() => setDetailId(null)} equipmentId={detailId} />
    </>
  );
}
