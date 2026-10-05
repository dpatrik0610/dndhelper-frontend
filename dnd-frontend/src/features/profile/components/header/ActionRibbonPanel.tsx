import { useState, type CSSProperties, type ReactNode } from "react";
import { Group, Popover, Portal, Stack, Text, Divider, ActionIcon, Button, Tooltip, Box, type PopoverProps } from "@mantine/core";
import CustomBadge from "@components/common/CustomBadge";
import type { Character } from "@appTypes/Character/Character";
import { useIsMobile } from "@hooks/useIsMobile";
import { ActionBubble } from "./ActionBubble";
import classes from "./ActionRibbonPanel.module.css";

import {
  IconEdit,
  IconMoon,
  IconFlame,
  IconDice5,
  IconHeartPlus,
  IconCoin,
  IconAward,
  IconTrash,
  IconBolt,
  IconX,
} from "@tabler/icons-react";

interface ActionRibbonPanelProps {
  character: Character;
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

interface RibbonAction {
  label: string;
  tooltip: string;
  icon: ReactNode;
  onClick?: () => void;
  /** Opens a popover instead of running onClick. */
  dropdown?: ReactNode;
  dropdownPosition?: PopoverProps["position"];
  dropdownStyle?: CSSProperties;
  badge?: number;
}

const dropdownBase: CSSProperties = {
  backdropFilter: "blur(24px) saturate(130%)",
  WebkitBackdropFilter: "blur(24px) saturate(130%)",
  border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
  borderRadius: "12px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45), var(--theme-glow-shadow-primary)",
  padding: "16px",
  color: "var(--theme-color-text-primary, #fff)",
};

const sectionLabel: CSSProperties = {
  letterSpacing: "2px",
  color: "var(--theme-color-text-secondary, #cbd5e1)",
  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
};

function CountBadge({ count, style }: { count: number; style?: CSSProperties }) {
  return (
    <Box
      style={{
        position: "absolute",
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
        ...style,
      }}
    >
      {count}
    </Box>
  );
}

function ProficienciesList({ character }: { character: Character }) {
  return (
    <Stack gap="xs">
      <Text fw={300} size="xs" tt="uppercase" style={sectionLabel}>
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

      <Text fw={300} size="xs" tt="uppercase" style={sectionLabel}>
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
  );
}

function ConditionsList({
  character,
  conditionsCount,
  onOpenAddCondition,
  onRemoveCondition,
  onOpenDetails,
}: Pick<ActionRibbonPanelProps, "character" | "conditionsCount" | "onOpenAddCondition" | "onRemoveCondition" | "onOpenDetails">) {
  return (
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
  );
}

export function ActionRibbonPanel(props: ActionRibbonPanelProps) {
  const { character, conditionsCount, onNavigate, onLongrest, onOpenRoll, onOpenHp, onOpenMoney } = props;
  const isMobile = useIsMobile();

  const actions: RibbonAction[] = [
    { label: "Edit", tooltip: "Edit Character", icon: <IconEdit size={18} />, onClick: () => onNavigate("/editCharacter") },
    { label: "Rest", tooltip: "Long Rest", icon: <IconMoon size={18} />, onClick: onLongrest },
    {
      label: "Proficiencies",
      tooltip: "Proficiencies & Languages",
      icon: <IconAward size={18} />,
      dropdown: <ProficienciesList character={character} />,
      dropdownPosition: "bottom",
      dropdownStyle: { background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.9))", maxWidth: "280px" },
    },
    { label: "Roll", tooltip: "Roll Dice", icon: <IconDice5 size={18} />, onClick: onOpenRoll },
    { label: "Health", tooltip: "Manage HP", icon: <IconHeartPlus size={18} />, onClick: onOpenHp },
    { label: "Money", tooltip: "Manage Money", icon: <IconCoin size={18} />, onClick: onOpenMoney },
    {
      label: "Conditions",
      tooltip: "Active Conditions",
      icon: <IconFlame size={18} />,
      dropdown: <ConditionsList {...props} />,
      dropdownPosition: "bottom-end",
      dropdownStyle: { background: "var(--theme-bg-panel, rgba(15, 15, 15, 0.92))", minWidth: "260px" },
      badge: conditionsCount,
    },
  ];

  if (isMobile) return <ActionDial actions={actions} badge={conditionsCount} />;

  return (
    <Group gap="sm" grow wrap="wrap" style={{ width: "100%" }}>
      {actions.map((action) =>
        action.dropdown ? (
          <Popover key={action.label} position={action.dropdownPosition} withArrow shadow="md" trapFocus={false}>
            <Popover.Target>
              <div style={{ position: "relative", display: "inline-flex", flex: "1 1 auto", justifyContent: "center" }}>
                <Tooltip label={action.tooltip} position="top" withArrow>
                  <div>
                    <ActionBubble label={action.label} icon={action.icon} />
                  </div>
                </Tooltip>
                {!!action.badge && <CountBadge count={action.badge} style={{ top: -4, right: "calc(50% - 20px)" }} />}
              </div>
            </Popover.Target>
            <Popover.Dropdown style={{ ...dropdownBase, ...action.dropdownStyle }}>{action.dropdown}</Popover.Dropdown>
          </Popover>
        ) : (
          <Tooltip key={action.label} label={action.tooltip} position="top" withArrow>
            <div style={{ display: "flex", flex: "1 1 auto" }}>
              <ActionBubble label={action.label} icon={action.icon} onClick={action.onClick} />
            </div>
          </Tooltip>
        )
      )}
    </Group>
  );
}

/**
 * Phones: one bubble above the chat bubble that fans the actions out upwards. Its backdrop covers the chat bubble,
 * and the open chat (full screen) hides it, so only one of the two is in use at a time.
 */
function ActionDial({ actions, badge }: { actions: RibbonAction[]; badge: number }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    // The header's backdrop-filter would otherwise become the containing block of these fixed elements.
    <Portal>
      {open && <div className={classes.backdrop} onClick={close} aria-hidden />}
      <div className={classes.dial}>
        {open && (
          <div className={classes.items} role="menu" aria-label="Character actions">
            {actions.map((action, i) => {
              const bubble = (
                <div className={classes.bubble}>
                  <ActionBubble label={action.label} icon={action.icon} onClick={action.dropdown ? undefined : () => { close(); action.onClick?.(); }} />
                  {!!action.badge && <CountBadge count={action.badge} style={{ top: -4, right: -4 }} />}
                </div>
              );
              return (
                <div key={action.label} className={classes.item} role="menuitem" style={{ animationDelay: `${(actions.length - 1 - i) * 25}ms` }}>
                  <span className={classes.label}>{action.label}</span>
                  {action.dropdown ? (
                    <Popover position="left" withArrow shadow="md" trapFocus={false}>
                      <Popover.Target>{bubble}</Popover.Target>
                      <Popover.Dropdown style={{ ...dropdownBase, ...action.dropdownStyle, maxWidth: "calc(100vw - 110px)" }}>{action.dropdown}</Popover.Dropdown>
                    </Popover>
                  ) : (
                    bubble
                  )}
                </div>
              );
            })}
          </div>
        )}
        <button
          type="button"
          className={classes.toggle}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close character actions" : "Character actions"}
          aria-expanded={open}
        >
          <span key={open ? "close" : "open"} className={classes.toggleIcon}>
            {open ? <IconX size={22} /> : <IconBolt size={22} />}
          </span>
          {!open && badge > 0 && <CountBadge count={badge} style={{ top: -2, right: -2 }} />}
        </button>
      </div>
    </Portal>
  );
}
