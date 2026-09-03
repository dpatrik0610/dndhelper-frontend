import { useState, useEffect } from "react";
import { Box, Group, Stack, Text, Paper } from "@mantine/core";
import { IconCoins, IconGift } from "@tabler/icons-react";
import type { Currency } from "@appTypes/Currency";
import { getEquipmentByIds } from "@services/equipmentService";

interface QuestRewardsProps {
  rewardCurrencies?: Currency[];
  rewardItemIds?: string[];
  onViewEquipment: (equipmentId: string) => void;
}

export function QuestRewards({
  rewardCurrencies,
  rewardItemIds,
  onViewEquipment,
}: QuestRewardsProps) {
  const [rewardItems, setRewardItems] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (rewardItemIds && rewardItemIds.length > 0) {
      getEquipmentByIds(rewardItemIds)
        .then((items) => {
          setRewardItems(
            items.map((item) => ({ id: item.id || "", name: item.name || "Unknown Item" }))
          );
        })
        .catch((err) => {
          console.error("Failed to load quest reward items:", err);
        });
    }
  }, [rewardItemIds]);

  const hasCurrency = rewardCurrencies && rewardCurrencies.length > 0;
  const hasItems = rewardItemIds && rewardItemIds.length > 0;

  if (!hasCurrency && !hasItems) {
    return null;
  }

  return (
    <Box
      mt="md"
      pt="sm"
      style={{
        borderTop: "1px dashed var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
      }}
    >
      <Stack gap="xs">
        {/* Coins Reward */}
        {hasCurrency ? (
          <Group gap="xs" align="center" wrap="nowrap">
            <IconCoins size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
            <Text size="xs" c="var(--theme-color-text-secondary)" truncate="end">
              Coins: {rewardCurrencies.map((c) => `${c.amount} ${c.currencyCode || c.type}`).join(", ")}
            </Text>
          </Group>
        ) : 
        <Text size="xs" c="var(--theme-color-text-secondary)" truncate="end">
          No coin rewards.
        </Text>
        }

        {/* Loot/Items Reward as Clickable themed boxes (1 per line) */}
        {hasItems && (
          <Group gap="xs" align="flex-start" wrap="nowrap">
            <IconGift
              size={14}
              color="var(--theme-color-accent-secondary, #06b6d4)"
              style={{ marginTop: 2, flexShrink: 0 }}
            />
            <Box style={{ flex: 1 }}>
              <Text
                size="xs"
                c="var(--theme-color-text-secondary)"
                mb={6}
                fw={600}
                tt="uppercase"
                style={{ letterSpacing: "0.5px" }}
              >
                Rewards:
              </Text>
              <Stack gap="xs">
                {rewardItems.length > 0 ? (
                  rewardItems.map((item, idx) => (
                    <Paper
                      key={`${item.id}-${idx}`}
                      p="xs"
                      style={{
                        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.4))",
                        border: "1px solid var(--theme-border-glow, rgba(6, 182, 212, 0.25))",
                        boxShadow: "var(--theme-glow-shadow-secondary)",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onClick={() => onViewEquipment(item.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--theme-color-accent-secondary, #06b6d4)";
                        e.currentTarget.style.background = "var(--theme-bg-hover, rgba(168, 85, 247, 0.08))";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--theme-border-glow, rgba(6, 182, 212, 0.25))";
                        e.currentTarget.style.background = "var(--theme-bg-panel, rgba(15, 15, 15, 0.4))";
                      }}
                    >
                      <Text size="xs" fw={500} c="var(--theme-color-accent-secondary, #06b6d4)">
                        {item.name}
                      </Text>
                      <Text
                        size="10px"
                        c="var(--theme-color-text-secondary)"
                        style={{ letterSpacing: "0.5px", textTransform: "uppercase" }}
                      >
                        Inspect
                      </Text>
                    </Paper>
                  ))
                ) : (
                  rewardItemIds.map((itemId, idx) => (
                    <Paper
                      key={`${itemId}-${idx}`}
                      p="xs"
                      style={{
                        background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.4))",
                        border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                      onClick={() => onViewEquipment(itemId)}
                    >
                      <Text size="xs" c="var(--theme-color-text-secondary)">
                        Loading reward details...
                      </Text>
                    </Paper>
                  ))
                )}
              </Stack>
            </Box>
          </Group>
        )}
      </Stack>
    </Box>
  );
}
