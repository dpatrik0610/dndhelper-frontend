import {
  Modal,
  TextInput,
  Stack,
  Button,
  ScrollArea,
  Group,
  Text,
  Paper,
  Loader,
  NumberInput,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconSearch, IconBox } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { useAdminEquipmentStore } from "@store/admin/useAdminEquipmentStore";
import { useAdminInventoryStore } from "@store/admin/useAdminInventoryStore";
import type { Equipment } from "../../../../../types/Equipment/Equipment";
import "../../../../../styles/AddExistingItemModal.css";

export function AddExistingItemModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { equipments, loadAll } = useAdminEquipmentStore();
  const { addExisting } = useAdminInventoryStore();

  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [visible, setVisible] = useState(30);

  useEffect(() => {
    if (opened) {
      setLoading(true);
      loadAll().finally(() => setLoading(false));
    }
  }, [opened]);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(
      equipments.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.index?.toLowerCase().includes(q)
      )
    );
    setVisible(30);
  }, [query, equipments]);

  const visibleItems = useMemo(() => filtered.slice(0, visible), [filtered, visible]);

  const handleAdd = async (eq: Equipment) => {
    const amount = quantities[eq.id!] ?? 1;
    await addExisting(eq.id!, amount);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Existing Item"
      centered={!isMobile}
      fullScreen={isMobile}
      size={isMobile ? "100%" : "xl"}
      radius="md"
      padding={isMobile ? "sm" : "md"}
      classNames={{
        content: "modal-content",
        header: "modal-header",
        title: "modal-title",
      }}
    >
      <Stack gap="md" style={{ height: isMobile ? "100%" : "auto" }}>
        <TextInput
          placeholder="Search equipment..."
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          radius="md"
          className="modal-search"
        />

        {loading ? (
          <Group justify="center" py="xl">
            <Loader color="cyan" />
          </Group>
        ) : (
          <ScrollArea
            h={isMobile ? "calc(100vh - 170px)" : 600}
            type="hover"
            offsetScrollbars
            onScrollPositionChange={({ y }) => {
              const endReached = filtered.length > visible && y >= (filtered.length / visible) * 20;
              if (endReached) setVisible((v) => Math.min(v + 30, filtered.length));
            }}
          >
            <Stack gap="xs">
              {visibleItems.length === 0 ? (
                <Text ta="center" c="dimmed" py="sm">
                  No matching equipment found.
                </Text>
              ) : (
                visibleItems.map((eq) => (
                  <Paper
                    key={eq.id}
                    p={isMobile ? "sm" : "md"}
                    radius="md"
                    withBorder
                    className="equipment-card"
                    onClick={() => handleAdd(eq)}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <IconBox size={18} color="#6ff" />
                        <Stack gap={0} style={{ lineHeight: 1 }}>
                          <Text fw={500} size={isMobile ? "sm" : "md"} c="white" lineClamp={1}>
                            {eq.name}
                          </Text>
                          {eq.cost && (
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {eq.cost.quantity} {eq.cost.unit}
                            </Text>
                          )}
                        </Stack>
                      </Group>

                      <Group gap={4} wrap="nowrap">
                        <NumberInput
                          value={quantities[eq.id!] ?? 1}
                          onChange={(v) =>
                            setQuantities((p) => ({ ...p, [eq.id!]: Number(v) || 1 }))
                          }
                          min={1}
                          max={99}
                          hideControls
                          radius="sm"
                          size="xs"
                          w={60}
                          className="equipment-qty"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size={isMobile ? "compact-sm" : "xs"}
                          color="teal"
                          variant="light"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(eq);
                          }}
                        >
                          Add
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                ))
              )}

              {visible < filtered.length && (
                <Group justify="center" py="sm">
                  <Loader size="sm" color="cyan" />
                </Group>
              )}
            </Stack>
          </ScrollArea>
        )}
      </Stack>
    </Modal>
  );
}
