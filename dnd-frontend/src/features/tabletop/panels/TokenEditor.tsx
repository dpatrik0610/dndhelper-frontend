import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  ColorInput,
  FileButton,
  Group,
  Modal,
  NumberInput,
  SimpleGrid,
  Slider,
  Stack,
  SegmentedControl,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import { useIsMobile } from "@hooks/useIsMobile";
import type { TableLayer } from "@appTypes/Tabletop";
import { LAYERS } from "@features/tabletop/tools";
import type { TableToken } from "@appTypes/Tabletop";
import { tabletop, uploadTableImage } from "@features/tabletop/useTabletopHub";
import { TOKEN_SWATCHES } from "@features/tabletop/tools";
import { AddConditionModal } from "./AddConditionModal";


/** DM-only editor for every token field. */
export function TokenEditor() {
  const tokenId = useTabletopStore((s) => s.editingTokenId);
  const token = useTabletopStore((s) => s.snapshot?.tokens.find((t) => t.id === tokenId));
  const close = () => useTabletopStore.getState().set({ editingTokenId: null });
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={!!token}
      onClose={close}
      title="Token"
      centered
      size="lg"
      fullScreen={isMobile}
      classNames={{ content: "tt-solid", header: "tt-solid" }}
    >
      {/* Keyed so opening another token starts a fresh draft */}
      {token && <TokenForm key={token.id} token={token} onClose={close} />}
    </Modal>
  );
}

function TokenForm({ token, onClose: close }: { token: TableToken; onClose: () => void }) {
  const tableId = useTabletopStore((s) => s.session?.tableId);
  const [draft, setDraft] = useState<TableToken>(token);
  const [addingEffect, setAddingEffect] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (patch: Partial<TableToken>) => setDraft((d) => ({ ...d, ...patch }));
  const num = (v: string | number, fallback = 0) => (typeof v === "number" ? v : fallback);

  const save = () => {
    void tabletop.upsertToken(draft);
    close();
  };

  const upload = async (file: File | null) => {
    if (!file || !tableId) return;
    setUploading(true);
    const url = await uploadTableImage(tableId, file);
    setUploading(false);
    if (url) set({ imageUrl: url });
  };

  return (
        <Stack gap="sm">
          {draft.characterId && (
            <Text size="xs" c="dimmed">
              Linked to a character: HP, AC and effects are saved to the character sheet too.
            </Text>
          )}
          <Group grow align="flex-end">
            <TextInput label="Name" value={draft.name} onChange={(e) => set({ name: e.currentTarget.value })} />
            <ColorInput label="Color" value={draft.color} onChange={(color) => set({ color })} swatches={TOKEN_SWATCHES} format="hex" />
          </Group>

          <Group align="flex-end" gap="xs" wrap="nowrap">
            <TextInput
              label="Image"
              placeholder="Upload or paste an https:// URL"
              value={draft.imageUrl ?? ""}
              onChange={(e) => set({ imageUrl: e.currentTarget.value || null })}
              style={{ flex: 1 }}
            />
            <FileButton onChange={upload} accept="image/png,image/jpeg,image/webp,image/gif">
              {(props) => (
                <Button {...props} variant="light" leftSection={<IconUpload size={14} />} loading={uploading}>
                  Upload
                </Button>
              )}
            </FileButton>
          </Group>

          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <NumberInput label="HP" min={0} value={draft.hp} onChange={(v) => set({ hp: num(v) })} />
            <NumberInput label="Max HP" min={0} value={draft.maxHp} onChange={(v) => set({ maxHp: num(v) })} />
            <NumberInput label="Temp HP" min={0} value={draft.tempHp} onChange={(v) => set({ tempHp: num(v) })} />
            <NumberInput label="AC" min={0} value={draft.ac} onChange={(v) => set({ ac: num(v) })} />
            <NumberInput
              label="Initiative"
              placeholder="Not in combat"
              value={draft.initiative ?? ""}
              onChange={(v) => set({ initiative: typeof v === "number" ? v : null })}
            />
            <NumberInput label="Speed (ft)" min={0} step={5} value={draft.speed} onChange={(v) => set({ speed: num(v, 30) })} />
          </SimpleGrid>

          <div>
            <Text size="sm" fw={500} mb={4}>
              Size: {draft.size} {draft.size === 1 ? "cell" : "cells"}
            </Text>
            <Slider
              min={0.5}
              max={4}
              step={0.5}
              value={draft.size}
              onChange={(size) => set({ size })}
              marks={[{ value: 1, label: "Medium" }, { value: 2, label: "Large" }, { value: 3, label: "Huge" }, { value: 4, label: "Gargantuan" }]}
              mb="lg"
            />
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>
              Effects
            </Text>
            <Group gap={6}>
              {draft.effects.map((e) => (
                <Badge
                  key={e.id || e.label}
                  variant="light"
                  color="grape"
                  rightSection={
                    <IconX
                      size={11}
                      style={{ cursor: "pointer" }}
                      onClick={() => set({ effects: draft.effects.filter((x) => x !== e) })}
                    />
                  }
                >
                  {e.label}
                  {e.remaining !== null && ` · ${e.remaining} turns`}
                </Badge>
              ))}
              <ActionIcon variant="light" color="grape" size="sm" onClick={() => setAddingEffect(true)} aria-label="Add effect">
                <IconPlus size={14} />
              </ActionIcon>
            </Group>
          </div>

          <div>
            <Text size="sm" fw={500} mb={4}>
              Layer
            </Text>
            <SegmentedControl
              fullWidth
              value={draft.layer}
              onChange={(layer) => set({ layer: layer as TableLayer })}
              data={LAYERS.map((l) => ({ value: l.layer, label: l.label }))}
            />
            <Text size="xs" c="dimmed" mt={4}>
              {LAYERS.find((l) => l.layer === draft.layer)?.hint}
            </Text>
          </div>

          <Group justify="space-between" mt="sm">
            <Button
              color="red"
              variant="subtle"
              leftSection={<IconTrash size={14} />}
              onClick={() => {
                void tabletop.removeToken(draft.id);
                close();
              }}
            >
              Remove from table
            </Button>
            <Group gap="xs">
              <Button variant="default" onClick={close}>
                Cancel
              </Button>
              <Button onClick={save}>Save</Button>
            </Group>
          </Group>

          <AddConditionModal
            opened={addingEffect}
            onClose={() => setAddingEffect(false)}
            existingLabels={draft.effects.map((e) => e.label)}
            onSubmit={(label, remaining) => set({ effects: [...draft.effects, { id: "", label, remaining }] })}
          />
        </Stack>
  );
}
