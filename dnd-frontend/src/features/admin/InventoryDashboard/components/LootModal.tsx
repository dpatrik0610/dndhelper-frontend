import { useState } from "react";
import { NumberInput, SegmentedControl, Select, SimpleGrid, Stack, TagsInput, Text, TextInput } from "@mantine/core";
import { BaseModal } from "@components/BaseModal";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import { useAdminInventoryStore } from "@store/admin/adminInventoryStore";
import { useCampaignStore } from "@store/campaign/campaignStore";
import type { EquipmentTier } from "@features/inventory/components/styles/equipmentTheme";

// Display copy of LootService.TierRates (percent per roll).
const TIER_RATES: [EquipmentTier, number][] = [
  ["Common", 50],
  ["Uncommon", 28],
  ["Rare", 14],
  ["Very Rare", 6],
  ["Legendary", 1.8],
  ["Artifact", 0.2],
];

const fieldClasses = { input: "glassy-input", label: "glassy-label" };

interface LootModalProps {
  opened: boolean;
  onClose: () => void;
  characters: { value: string; label: string }[];
}

export function LootModal({ opened, onClose, characters }: LootModalProps) {
  const generateLoot = useAdminInventoryStore((s) => s.generateLoot);
  const campaignId = useCampaignStore((s) => s.selectedId);

  const [name, setName] = useState("");
  const [mode, setMode] = useState<"random" | "tiers">("random");
  const [count, setCount] = useState(5);
  const [tierCounts, setTierCounts] = useState<Record<string, number>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tierTotal = Object.values(tierCounts).reduce((sum, n) => sum + n, 0);
  const canGenerate = name.trim().length > 0 && (mode === "random" ? count > 0 : tierTotal > 0);

  const generate = async () => {
    if (!canGenerate || busy) return;
    setBusy(true);
    try {
      await generateLoot({
        name: name.trim(),
        campaignId,
        characterIds: characterId ? [characterId] : [],
        count: mode === "random" ? count : 0,
        tierCounts: mode === "tiers" ? tierCounts : undefined,
        tags,
      });
      setName("");
      onClose();
    } catch (err) {
      showNotification({ title: "Loot failed", message: String(err), color: SectionColor.Red });
    } finally {
      setBusy(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Generate Loot"
      size="md"
      loading={busy}
      onSave={generate}
      saveLabel="Generate"
    >
      <Stack gap="md">
        <TextInput
          label="Inventory name"
          placeholder="e.g. Goblin Chief's Stash"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          classNames={fieldClasses}
        />

        <SegmentedControl
          fullWidth
          size="xs"
          value={mode}
          onChange={(v) => setMode(v as "random" | "tiers")}
          data={[
            { value: "random", label: "Random" },
            { value: "tiers", label: "Pick per tier" },
          ]}
        />

        {mode === "random" ? (
          <>
            <NumberInput
              label="Number of items"
              min={1}
              max={100}
              allowDecimal={false}
              allowNegative={false}
              value={count}
              onChange={(v) => setCount(Number(v) || 0)}
              classNames={fieldClasses}
            />
            <Text size="xs" c="dimmed">
              Each item rolls its tier first: {TIER_RATES.map(([tier, pct]) => `${tier} ${pct}%`).join(" · ")}
            </Text>
          </>
        ) : (
          <SimpleGrid cols={{ base: 2, xs: 3 }} spacing="xs">
            {TIER_RATES.map(([tier]) => (
              <NumberInput
                key={tier}
                label={tier}
                min={0}
                max={100}
                allowDecimal={false}
                allowNegative={false}
                value={tierCounts[tier] ?? 0}
                onChange={(v) => setTierCounts((prev) => ({ ...prev, [tier]: Number(v) || 0 }))}
                classNames={fieldClasses}
              />
            ))}
          </SimpleGrid>
        )}

        <TagsInput
          label="Tags"
          description="Only items with at least one of these tags. Leave empty for any item."
          placeholder="e.g. weapon, potion"
          value={tags}
          onChange={setTags}
          clearable
          classNames={fieldClasses}
        />

        <Select
          label="Give to character (optional)"
          placeholder="Unowned"
          value={characterId}
          onChange={setCharacterId}
          data={characters}
          clearable
          classNames={fieldClasses}
        />
      </Stack>
    </BaseModal>
  );
}
