import { useState } from "react";
import { Avatar, Button, Group, NumberInput, Popover, Select, Text } from "@mantine/core";
import { IconDice5, IconSwords } from "@tabler/icons-react";
import { DiceResult } from "@components/roll/Dice";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useCharacterList } from "@store/character/characterSelectors";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import { resolveImageUrl, tabletop } from "./useTabletopHub";
import { signed, useTableRoll } from "./useTableRoll";

/**
 * "Join combat" for players whose token isn't in the initiative order yet: roll d20 + the sheet's
 * initiative bonus (rolled on the server, logged for everyone) or type the number rolled at the table.
 */
export function JoinCombat() {
  const me = useCurrentUserId() ?? "";
  const isDm = useTabletopStore((s) => s.session?.isDm ?? false);
  const tokens = useTabletopStore((s) => s.snapshot?.tokens ?? []);
  const fighting = useTabletopStore((s) => !!s.snapshot && (s.snapshot.turn.active || s.snapshot.tokens.some((t) => t.initiative !== null)));
  const characters = useCharacterList();
  const [opened, setOpened] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [typed, setTyped] = useState<number | "">("");
  const [saving, setSaving] = useState(false);
  const dice = useTableRoll();

  // The DM sets initiative in the initiative panel; this is for players' own tokens only.
  const waiting = isDm ? [] : tokens.filter((t) => t.layer === "Token" && t.ownerIds.includes(me) && t.initiative === null);
  // Stays open after a roll so the landed dice can be seen; gone once closed with nothing left to join.
  if (waiting.length === 0 && !opened) return null;

  const token = waiting.find((t) => t.id === pickedId) ?? waiting[0];
  const bonus = characters.find((c) => c.id === token?.characterId)?.initiative ?? 0;

  const roll = async () => {
    if (!token) return;
    const result = await dice.animate(tabletop.setInitiative(token.id, null).then((r) => (r.ok ? r.value : null)), 20);
    // Leave the landed dice up for a moment, then close.
    if (result) setTimeout(() => setOpened(false), 1600);
  };

  const submit = async () => {
    if (!token || typed === "") return;
    setSaving(true);
    const { ok } = await tabletop.setInitiative(token.id, typed);
    setSaving(false);
    if (ok) {
      setTyped("");
      setOpened(false);
    }
  };

  return (
    <Popover opened={opened} onChange={setOpened} position="top" withArrow shadow="xl" radius="lg" width={290} trapFocus>
      <Popover.Target>
        <button
          type="button"
          className={`tt-join${fighting ? " urgent" : ""}`}
          onClick={() => setOpened((o) => !o)}
          aria-expanded={opened}
          disabled={!token}
        >
          <IconSwords size={18} />
          <span>{fighting ? "Join combat" : "Roll initiative"}</span>
        </button>
      </Popover.Target>

      <Popover.Dropdown className="tt-join-panel tt-solid">
        {token && (
          <>
            <Group gap="sm" wrap="nowrap" mb="sm">
              <Avatar src={resolveImageUrl(token.imageUrl)} radius="xl" size={36} style={{ background: token.color }}>
                {token.name.slice(0, 2).toUpperCase()}
              </Avatar>
              {waiting.length > 1 ? (
                <Select
                  size="xs"
                  value={token.id}
                  data={waiting.map((t) => ({ value: t.id, label: t.name }))}
                  onChange={setPickedId}
                  allowDeselect={false}
                  style={{ flex: 1 }}
                />
              ) : (
                <div>
                  <Text fw={700} lh={1.2}>
                    {token.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Initiative bonus {signed(bonus)}
                  </Text>
                </div>
              )}
            </Group>

            <Button
              fullWidth
              size="md"
              radius="md"
              className="tt-cta"
              leftSection={<IconDice5 size={18} />}
              onClick={() => void roll()}
              loading={dice.rolling}
            >
              Roll d20 {signed(bonus)}
            </Button>

            <div className="tt-join-or">or type what you rolled</div>

            <Group gap="xs" wrap="nowrap">
              <NumberInput
                size="sm"
                placeholder="17"
                min={-20}
                max={99}
                allowDecimal={false}
                hideControls
                value={typed}
                onChange={(v) => setTyped(typeof v === "number" ? v : "")}
                onKeyDown={(e) => e.key === "Enter" && void submit()}
                style={{ flex: 1 }}
                aria-label="Initiative"
              />
              <Button size="sm" variant="light" onClick={() => void submit()} loading={saving} disabled={typed === ""}>
                Set
              </Button>
            </Group>
          </>
        )}

        {(dice.rolling || dice.result) && (
          <div className="tt-join-dice">
            <DiceResult result={dice.result} rolling={dice.rolling} sides={dice.sides} count={dice.count} />
          </div>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
