import { useEffect } from "react";
import { Text } from "@mantine/core";
import { IconArchive } from "@tabler/icons-react";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useAdminCurrencyStore } from "@store/admin/adminCurrencyStore";
import { MetaPanel } from "./MetaPanel";
import { ItemsPanel } from "./ItemsPanel";
import styles from "@styles/InventoryDashboard.module.css";

export function InventoryWorkspace() {
  const { selected } = useAdminInventoryStore();
  const { loadInventoryById } = useAdminCurrencyStore();

  useEffect(() => {
    if (selected?.id) {
      void loadInventoryById(selected.id);
    }
  }, [selected?.id, loadInventoryById]);

  if (!selected) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateInner}>
          <IconArchive size={36} color="#818cf8" stroke={1.3} />
          <Text size="sm" c="dimmed" maw={280}>
            Select an inventory from the sidebar to manage its contents.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workspacePanel}>
      <MetaPanel />
      <ItemsPanel />
    </div>
  );
}
