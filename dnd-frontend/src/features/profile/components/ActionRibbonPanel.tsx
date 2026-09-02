import { Group, Popover, Stack, Text, Divider, ActionIcon, Button, Tooltip, Box } from "@mantine/core";
import CustomBadge from "@components/common/CustomBadge";
import { ActionBubble } from "./ActionBubble";

import {
  IconEdit,
  IconMoon,
  IconFlame,
  IconDice5,
  IconHeartPlus,
  IconCoin,
  IconAward,
  IconTrash,
} from "@tabler/icons-react";

interface ActionRibbonPanelProps {
  character: any;
  conditionsCount: number;
  onNavigate: (path: string) => void;
  onLongrest: () => void;
  onOpenAddCondition: () => void;
  onRemoveCondition: (cond: string) => void;
  onOpenDetails: (cond: string) => void;
  onOpenRoll: () => void;
  onOpenHp: () => void;
  onOpenMoney: () => void;
}

export function ActionRibbonPanel({
  character,
  conditionsCount,
  onNavigate,
  onLongrest,
  onOpenAddCondition,
  onRemoveCondition,
  onOpenDetails,
  onOpenRoll,
  onOpenHp,
  onOpenMoney,
}: ActionRibbonPanelProps) {
  return (
    <Group gap="sm" grow wrap="wrap" style={{ width: "100%" }}>
      
      {/* 1. Edit Character */}
      <Tooltip label="Edit Character" position="top" withArrow>
        <div style={{ display: "flex", flex: "1 1 auto" }}>
          <ActionBubble
            label="Edit"
            icon={<IconEdit size={18} />}
            onClick={() => onNavigate("/editCharacter")}
          />
        </div>
      </Tooltip>

      {/* 2. Long Rest */}
      <Tooltip label="Long Rest" position="top" withArrow>
        <div style={{ display: "flex", flex: "1 1 auto" }}>
          <ActionBubble
            label="Rest"
            icon={<IconMoon size={18} />}
            onClick={onLongrest}
          />
        </div>
      </Tooltip>

      {/* 3. Proficiencies */}
      <Popover position="bottom" withArrow shadow="md" trapFocus={false}>
        <Popover.Target>
          <div style={{ display: "inline-flex", flex: "1 1 auto", justifyContent: "center" }}>
            <Tooltip label="Proficiencies & Languages" position="top" withArrow>
              <div>
                <ActionBubble
                  label="Proficiencies"
                  icon={<IconAward size={18} />}
                />
              </div>
            </Tooltip>
          </div>
        </Popover.Target>
        <Popover.Dropdown
          style={{
            background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.9))",
            backdropFilter: "blur(24px) saturate(130%)",
            WebkitBackdropFilter: "blur(24px) saturate(130%)",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45), var(--theme-glow-shadow-primary)",
            padding: "16px",
            color: "var(--theme-color-text-primary, #fff)",
            maxWidth: "280px",
          }}
        >
          <Stack gap="xs">
            <Text
              fw={300}
              size="xs"
              tt="uppercase"
              style={{
                letterSpacing: "2px",
                color: "var(--theme-color-text-secondary, #cbd5e1)",
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              }}
            >
              Weapons & Tools
            </Text>
            {character.proficiencies?.length ? (
              <Group gap={6}>
                {character.proficiencies.map((p: string, i: number) => (
                  <CustomBadge key={i} label={p} variant="themed" radius="sm" />
                ))}
              </Group>
            ) : (
              <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
                None
              </Text>
            )}

            <Divider color="rgba(255, 255, 255, 0.08)" my={4} />

            <Text
              fw={300}
              size="xs"
              tt="uppercase"
              style={{
                letterSpacing: "2px",
                color: "var(--theme-color-text-secondary, #cbd5e1)",
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              }}
            >
              Languages
            </Text>
            {character.languages?.length ? (
              <Group gap={6}>
                {character.languages.map((l: string, i: number) => (
                  <CustomBadge key={i} label={l} variant="themed" radius="sm" />
                ))}
              </Group>
            ) : (
              <Text size="xs" c="dimmed" style={{ fontStyle: "italic" }}>
                None
              </Text>
            )}
          </Stack>
        </Popover.Dropdown>
      </Popover>

      {/* 4. Roll Dice */}
      <Tooltip label="Roll Dice" position="top" withArrow>
        <div style={{ display: "flex", flex: "1 1 auto" }}>
          <ActionBubble
            label="Roll"
            icon={<IconDice5 size={18} />}
            onClick={onOpenRoll}
          />
        </div>
      </Tooltip>

      {/* 5. Manage HP */}
      <Tooltip label="Manage HP" position="top" withArrow>
        <div style={{ display: "flex", flex: "1 1 auto" }}>
          <ActionBubble
            label="Health"
            icon={<IconHeartPlus size={18} />}
            onClick={onOpenHp}
          />
        </div>
      </Tooltip>

      {/* 6. Manage Money */}
      <Tooltip label="Manage Money" position="top" withArrow>
        <div style={{ display: "flex", flex: "1 1 auto" }}>
          <ActionBubble
            label="Money"
            icon={<IconCoin size={18} />}
            onClick={onOpenMoney}
          />
        </div>
      </Tooltip>

      {/* 7. Active Conditions */}
      <Popover position="bottom-end" withArrow shadow="md" trapFocus={false}>
        <Popover.Target>
          <div style={{ position: "relative", display: "inline-flex", flex: "1 1 auto", justifyContent: "center" }}>
            <Tooltip label="Active Conditions" position="top" withArrow>
              <div>
                <ActionBubble
                  label="Conditions"
                  icon={<IconFlame size={18} />}
                />
              </div>
            </Tooltip>
            {conditionsCount > 0 && (
              <Box
                style={{
                  position: "absolute",
                  top: -4,
                  right: "calc(50% - 20px)",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "var(--theme-color-accent-primary, #f59e0b)",
                  border: "1.5px solid #fff",
                  color: "#121214",
                  fontSize: "10px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  zIndex: 5,
                  boxShadow: "0 0 8px var(--theme-color-accent-primary, #f59e0b)",
                }}
              >
                {conditionsCount}
              </Box>
            )}
          </div>
        </Popover.Target>
        <Popover.Dropdown
          style={{
            background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.92))",
            backdropFilter: "blur(24px) saturate(130%)",
            WebkitBackdropFilter: "blur(24px) saturate(130%)",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45), var(--theme-glow-shadow-primary)",
            padding: "16px",
            color: "var(--theme-color-text-primary, #fff)",
            minWidth: "260px",
          }}
        >
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Text
                fw={700}
                size="xs"
                tt="uppercase"
                style={{
                  letterSpacing: "2px",
                  color: "var(--theme-color-text-primary, #fff)",
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Active Conditions
              </Text>
              <Button
                size="xs"
                variant="transparent"
                onClick={onOpenAddCondition}
                style={{
                  color: "var(--theme-color-accent-primary, #f59e0b)",
                  fontWeight: 700,
                  fontSize: "11px",
                  padding: 0,
                  height: "auto",
                  fontFamily: "var(--font-sans)",
                }}
              >
                + Add
              </Button>
            </Group>

            <Divider color="rgba(255, 255, 255, 0.08)" />

            {conditionsCount > 0 ? (
              <Stack gap="xs">
                {character.conditions.map((cond: string, i: number) => (
                  <Group key={i} justify="space-between" align="center" wrap="nowrap" style={{
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                  }}>
                    <Text
                      onClick={() => onOpenDetails(cond)}
                      style={{
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        fontFamily: "var(--font-sans)",
                        color: "var(--theme-color-accent-primary, #f59e0b)",
                        textDecoration: "underline",
                        textTransform: "uppercase",
                      }}
                    >
                      {cond}
                    </Text>
                    <ActionIcon
                      size="xs"
                      variant="transparent"
                      color="red"
                      onClick={() => onRemoveCondition(cond)}
                      title={`Remove ${cond}`}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            ) : (
              <Text size="xs" c="dimmed" style={{ fontStyle: "italic", textAlign: "center" }} py="xs">
                No active conditions
              </Text>
            )}
          </Stack>
        </Popover.Dropdown>
      </Popover>

    </Group>
  );
}
