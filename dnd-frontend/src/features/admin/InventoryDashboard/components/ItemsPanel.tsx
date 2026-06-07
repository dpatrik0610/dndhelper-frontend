import { useState } from "react";
import { Button, Group, ScrollArea, Text } from "@mantine/core";
import { IconBox, IconPlus } from "@tabler/icons-react";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { ItemCard } from "./ItemCard";
import { ItemModal } from "./ItemModal";
import { AddExistingItemModal } from "./AddExistingItemModal";
import styles from "@styles/InventoryDashboard.module.css";

export function ItemsPanel() {
  const { selected } = useAdminInventoryStore();
  const [addModal, setAddModal] = useState(false);
  const [existingModal, setExistingModal] = useState(false);

  if (!selected) return null;

  const items = selected.items ?? [];

  return (
    <>
      <div className={styles.itemsPanelHeader}>
        <span className={styles.itemsPanelTitle}>
          Items ({items.length})
        </span>

        <Group gap="xs">
          <Button
            size="compact-xs"
            variant="light"
            color="teal"
            leftSection={<IconBox size={12} />}
            onClick={() => setExistingModal(true)}
          >
            Add Existing
          </Button>
          <Button
            size="compact-xs"
            variant="light"
            color="indigo"
            leftSection={<IconPlus size={12} />}
            onClick={() => setAddModal(true)}
          >
            New Item
          </Button>
        </Group>
      </div>

      <ScrollArea className={styles.itemsPanelBody} offsetScrollbars>
        {items.length === 0 ? (
          <div className={styles.itemsEmpty}>
            <IconBox size={32} stroke={1.2} />
            <Text size="xs" c="dimmed" maw={220} ta="center">
              This inventory is empty. Add items using the buttons above.
            </Text>
          </div>
        ) : (
          <div className={styles.itemsGrid}>
            {items.map((item) => (
              <ItemCard key={item.equipmentId} itemId={item.equipmentId!} />
            ))}
          </div>
        )}
      </ScrollArea>

      <AddExistingItemModal opened={existingModal} onClose={() => setExistingModal(false)} />
      <ItemModal opened={addModal} onClose={() => setAddModal(false)} editMode={false} />
    </>
  );
}
