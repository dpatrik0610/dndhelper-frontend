import {
  ActionIcon,
  Badge,
  ColorInput,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconTrash, IconDotsVertical, IconPlus, IconX, IconRefresh } from "@tabler/icons-react";
import type { InitiativeEntry } from "@store/admin/useInitiativeTrackerStore";

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
                        <Group gap={6}>
                          <Badge size="sm" color="violet" variant="light">
                            {row.type}
                          </Badge>
                          <TextInput
                            size="xs"
                            value={row.name}
                            onChange={(e) => onChange(row.id, "name", e.currentTarget.value)}
                            classNames={{ input: "glassy-input", label: "glassy-label" }}
                            disabled={isCharacter && !isEditing}
                          />
                        </Group>
                      </Table.Td>
                    );
                  }

                  if (col.key === "initiative") {
                    return (
                      <Table.Td key={`${row.id}-init`}>
                        <NumberInput
                          size="xs"
                          value={row.initiative}
                          onChange={(val) => onChange(row.id, "initiative", Number(val ?? 0))}
                          classNames={{ input: "glassy-input", label: "glassy-label" }}
                          disabled={isCharacter && !isEditing}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "hp") {
                    return (
                      <Table.Td key={`${row.id}-hp`}>
                        <NumberInput
                          size="xs"
                          value={row.hp ?? 0}
                          onChange={(val) => onChange(row.id, "hp", Number(val ?? 0))}
                          classNames={{ input: "glassy-input", label: "glassy-label" }}
                          disabled={isCharacter && !isEditing}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "ac") {
                    return (
                      <Table.Td key={`${row.id}-ac`}>
                        <NumberInput
                          size="xs"
                          value={row.ac ?? 0}
                          onChange={(val) => onChange(row.id, "ac", Number(val ?? 0))}
                          classNames={{ input: "glassy-input", label: "glassy-label" }}
                          disabled={isCharacter && !isEditing}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "color") {
                    return (
                      <Table.Td key={`${row.id}-color`}>
                        <ColorInput
                          size="xs"
                          value={row.color}
                          onChange={(value) => onChange(row.id, "color", value)}
                          withPicker={false}
                          swatches={colorPresets}
                          swatchesPerRow={5}
                          classNames={{ input: "glassy-input", label: "glassy-label" }}
                          disabled={isCharacter && !isEditing}
                        />
                      </Table.Td>
                    );
                  }

                  if (col.key === "conditions") {
                    return (
                      <Table.Td key={`${row.id}-cond`}>
                        <Stack gap={4}>
                          <Group gap={4} wrap="wrap">
                            {(row.conditions || []).map((cond) => (
                              <Badge
                                key={cond.id}
                                color="red"
                                variant="light"
                                rightSection={
                                  <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    color="red"
                                    onClick={() => onRemoveCondition(row.id, cond.id)}
                                  >
                                    <IconX size={10} />
                                  </ActionIcon>
                                }
                              >
                                {cond.label}
                                {cond.remaining !== null ? ` (${cond.remaining})` : ""}
                              </Badge>
                            ))}
                            {(row.conditions || []).length === 0 && (
                              <Text size="xs" c="dimmed">
                                No conditions
                              </Text>
                            )}
                          </Group>
                          <Group gap={4}>
                            <TextInput
                              size="xs"
                              placeholder="Condition"
                              onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                const target = e.currentTarget;
                                const label = target.value.trim();
                                if (!label) return;
                                onAddCondition(row.id, label, null);
                                target.value = "";
                              }}
                              classNames={{ input: "glassy-input", label: "glassy-label" }}
                              disabled={isCharacter && !isEditing}
                            />
                            <NumberInput
                              size="xs"
                              placeholder="Dur."
                              min={0}
                              max={99}
                              onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                              }}
                              onBlur={(e) => {
                                const labelInput = (e.currentTarget.previousSibling as HTMLInputElement) ?? null;
                                if (!labelInput) return;
                                const label = labelInput.value.trim();
                                if (!label) return;
                                const val = Number(e.currentTarget.value || 0);
                                onAddCondition(row.id, label, Number.isFinite(val) ? val : null);
                                labelInput.value = "";
                                e.currentTarget.value = "";
                              }}
                              classNames={{ input: "glassy-input", label: "glassy-label" }}
                              disabled={isCharacter && !isEditing}
                            />
                            <Tooltip label="Add condition">
                              <ActionIcon
                                size="sm"
                                variant="light"
                                color="grape"
                                onClick={() => {
                                  const wrapper = (document.activeElement?.parentElement?.parentElement as HTMLElement) ?? null;
                                  const inputs = wrapper?.querySelectorAll("input");
                                  if (!inputs || inputs.length === 0) return;
                                  const [labelInput, durationInput] = Array.from(inputs);
                                  const label = (labelInput as HTMLInputElement).value.trim();
                                  const val = Number((durationInput as HTMLInputElement).value || 0);
                                  if (!label) return;
                                  onAddCondition(row.id, label, Number.isFinite(val) ? val : null);
                                  (labelInput as HTMLInputElement).value = "";
                                  (durationInput as HTMLInputElement).value = "";
                                }}
                                disabled={isCharacter && !isEditing}
                              >
                                <IconPlus size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Stack>
                      </Table.Td>
                    );
                  }

                  if (col.key === "actions") {
                    return (
                      <Table.Td key={`${row.id}-actions`}>
                        <Group gap="xs" justify="flex-end" wrap="nowrap" align="center">
                          <Tooltip label="More coming soon">
                            <ActionIcon size="md" variant="subtle">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Tooltip>
                          {isCharacter && (
                            <>
                              {!isEditing ? (
                                <Tooltip label="Enable editing">
                                  <ActionIcon
                                    size="md"
                                    variant="light"
                                    color="blue"
                                    onClick={() => onToggleEdit?.(row.id, true)}
                                  >
                                    <IconPlus size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              ) : (
                                <>
                                  <Tooltip label="Apply changes">
                                    <ActionIcon
                                      size="md"
                                      variant="filled"
                                      color="teal"
                                      loading={isSaving}
                                      onClick={() => onApplyEdit?.(row.id)}
                                    >
                                      <IconRefresh size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Tooltip label="Cancel editing">
                                    <ActionIcon
                                      size="md"
                                      variant="subtle"
                                      color="gray"
                                      onClick={() => onToggleEdit?.(row.id, false)}
                                      disabled={isSaving}
                                    >
                                      <IconX size={14} />
                                    </ActionIcon>
                                  </Tooltip>
                                </>
                              )}
                            </>
                          )}
                          <Tooltip label="Remove row">
                            <ActionIcon size="md" color="red" variant="light" onClick={() => onRemove(row.id)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
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
