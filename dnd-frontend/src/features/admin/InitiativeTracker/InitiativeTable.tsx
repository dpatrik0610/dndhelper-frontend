import { ActionIcon, Group, ScrollArea, Table, Tooltip } from "@mantine/core";
import type { InitiativeEntry } from "@store/admin/useInitiativeTrackerStore";
import { InitiativeActionsCell } from "./components/InitiativeActionsCell";
import { IconRefresh } from "@tabler/icons-react";
import { InitiativeNameCell } from "./components/InitiativeNameCell";
import { InitiativeStatCell } from "./components/InitiativeStatCell";
import { InitiativeColorCell } from "./components/InitiativeColorCell";
import { InitiativeConditionsCell } from "./components/InitiativeConditionsCell";

type ColumnKey = "name" | "initiative" | "hp" | "ac" | "conditions" | "color" | "actions";

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  width?: string | number;
}

const defaultColumns: ColumnConfig[] = [
  { key: "name", label: "Name" },
  { key: "initiative", label: "Init", width: 90 },
  { key: "hp", label: "HP", width: 90 },
  { key: "ac", label: "AC", width: 80 },
  { key: "color", label: "Tint", width: 140 },
  { key: "conditions", label: "Conditions" },
  { key: "actions", label: "", width: 70 },
];

interface InitiativeTableProps {
  rows: InitiativeEntry[];
  activeIndex: number;
  onChange: <K extends keyof InitiativeEntry>(id: string, field: K, value: InitiativeEntry[K]) => void;
  onRemove: (id: string) => void;
  onAddCondition: (id: string, label: string, remaining: number | null) => void;
  onRemoveCondition: (id: string, conditionId: string) => void;
  columns?: ColumnConfig[];
  onReload?: () => void;
  editingIds?: Set<string>;
  savingIds?: Set<string>;
  onToggleEdit?: (id: string, enable: boolean) => void;
  onApplyEdit?: (id: string) => void;
}

export function InitiativeTable({
  rows,
  activeIndex,
  onChange,
  onRemove,
  onAddCondition,
  onRemoveCondition,
  columns = defaultColumns,
  onReload,
  editingIds,
  savingIds,
  onToggleEdit,
  onApplyEdit,
}: InitiativeTableProps) {
  const colorPresets = ["#f87171","#fb923c","#facc15","#a3e635","#34d399","#22d3ee","#60a5fa","#a78bfa","#f472b6","#cbd5e1"];

  return (
    <ScrollArea h={800} classNames={{ viewport: "glassy-scroll" }}>
      {onReload && (
        <Group justify="flex-end" mb="xs">
          <Tooltip label="Reload initiative data">
            <ActionIcon variant="light" color="grape" onClick={onReload}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
      <Table
        highlightOnHover
        withTableBorder
        horizontalSpacing="sm"
        verticalSpacing="xs"
        styles={{
          table: { background: "transparent", borderColor: "rgba(180,150,255,0.3)" },
          td: { background: "rgba(120,80,200,0.05)" },
          
        }}
      >
        <Table.Thead>
          <Table.Tr>
            {columns.map((col) => (
              <Table.Th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row, index) => {
            const isActive = index === activeIndex;
            const isCharacter = row.type === "character";
            const isEditing = editingIds?.has(row.id) ?? false;
            const isSaving = savingIds?.has(row.id) ?? false;

            return (
              <Table.Tr key={row.id} style={isActive ? { outline: "3px solid rgba(255,120,100,0.6)" } : undefined}>
                {columns.map((col) => {
                  if (col.key === "name") {
                    return (
                      <Table.Td key={`${row.id}-name`}>
                        <InitiativeNameCell
                          row={row}
                          disabled={isCharacter && !isEditing}
                          onChange={(val) => onChange(row.id, "name", val)}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "initiative") {
                    return (
                      <Table.Td key={`${row.id}-init`}>
                        <InitiativeStatCell
                          value={row.initiative}
                          onChange={(val) => onChange(row.id, "initiative", val)}
                          disabled={isCharacter && !isEditing}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "hp") {
                    return (
                      <Table.Td key={`${row.id}-hp`}>
                        <InitiativeStatCell
                          value={row.hp}
                          onChange={(val) => onChange(row.id, "hp", val)}
                          disabled={isCharacter && !isEditing}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "ac") {
                    return (
                      <Table.Td key={`${row.id}-ac`}>
                        <InitiativeStatCell
                          value={row.ac}
                          onChange={(val) => onChange(row.id, "ac", val)}
                          disabled={isCharacter && !isEditing}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "color") {
                    return (
                      <Table.Td key={`${row.id}-color`}>
                        <InitiativeColorCell
                          value={row.color}
                          onChange={(value) => onChange(row.id, "color", value)}
                          presets={colorPresets}
                          disabled={isCharacter && !isEditing}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "conditions") {
                    return (
                      <Table.Td key={`${row.id}-cond`}>
                        <InitiativeConditionsCell
                          rowId={row.id}
                          conditions={row.conditions || []}
                          disabled={isCharacter && !isEditing}
                          onAdd={(label, remaining) => onAddCondition(row.id, label, remaining)}
                          onRemove={(condId) => onRemoveCondition(row.id, condId)}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "actions") {
                    return (
                      <Table.Td key={`${row.id}-actions`}>
                        <InitiativeActionsCell
                          rowId={row.id}
                          isCharacter={isCharacter}
                          isEditing={isEditing}
                          isSaving={isSaving}
                          onToggleEdit={onToggleEdit}
                          onApplyEdit={onApplyEdit}
                          onRemove={onRemove}
                        />
                      </Table.Td>
                    );
                  }

                  return null;
                })}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
