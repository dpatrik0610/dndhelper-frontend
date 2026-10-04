import { useState } from "react";
import { Badge, Button, Chip, Group, Loader, Select, Stack, Switch, Text, UnstyledButton } from "@mantine/core";
import { IconBackpack, IconWand } from "@tabler/icons-react";
import { Die, DiceResult } from "@components/roll/Dice";
import { useTableRoll } from "@features/tabletop/useTableRoll";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useCharacterList } from "@store/character/characterSelectors";
import { useDmView, useTabletopStore } from "@store/tabletop/tabletopStore";
import type { Character } from "@appTypes/Character/Character";
import type { TableToken } from "@appTypes/Tabletop";
import { tabletop } from "@features/tabletop/useTabletopHub";
import { InventoryModal } from "./InventoryModal";
import { useSpellAttacks } from "./tableActions";

const DICE = [4, 6, 8, 10, 12, 20, 100];

/** Dice, the active token's spells, inventory and action economy. */
export function ActionPanel() {
  const me = useCurrentUserId() ?? "";
  const session = useTabletopStore((s) => s.session);
  const snapshot = useTabletopStore((s) => s.snapshot);
  const characters = useCharacterList();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dice = useTableRoll();
  const [isPrivate, setIsPrivate] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const dmView = useDmView();

  if (!session || !snapshot) return null;
  const { tokens, turn } = snapshot;
  const isDm = session.isDm;

  // The DM rolls as anything; players (and the DM's player preview) as their own tokens.
  const mine = dmView ? tokens : tokens.filter((t) => t.ownerIds.includes(me) && t.layer !== "Dm");
  const token =
    mine.find((t) => t.id === selectedId) ??
    mine.find((t) => turn.active && t.id === turn.currentTokenId) ??
    mine[0];
  const character = characters.find((c) => c.id === token?.characterId);

  const roll = (expressions: string[], label?: string) =>
    void tabletop.roll({ expressions, label, as: token?.name, private: isDm && isPrivate });

  const rollDie = (sides: number) =>
    void dice.roll({ expressions: [`1d${sides}`], label: `d${sides}`, as: token?.name, private: isDm && isPrivate }, sides);

  return (
    <Stack gap="md" p="sm">
      {mine.length > 1 && (
        <Select
          size="xs"
          label={dmView ? "Roll as" : "Character"}
          data={mine.map((t) => ({ value: t.id, label: t.name }))}
          value={token?.id ?? null}
          onChange={setSelectedId}
          searchable
          allowDeselect={false}
        />
      )}

      {token && <Economy token={token} turnActive={turn.active} isCurrent={turn.currentTokenId === token.id} />}

      {character && (
        <>
          <Button variant="light" color="violet" size="xs" leftSection={<IconBackpack size={14} />} onClick={() => setInventoryOpen(true)}>
            Inventory
          </Button>
          <InventoryModal opened={inventoryOpen} onClose={() => setInventoryOpen(false)} character={character} onRoll={roll} />
          <Spells character={character} onRoll={roll} />
        </>
      )}

      <Stack gap={6}>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
          Dice
        </Text>
        {/* Same die shapes and tumble as the app's dice roller; the roll itself happens on the table server. */}
        <div className="tt-dice-row">
          {DICE.map((sides) => (
            <UnstyledButton key={sides} className="tt-die-btn" onClick={() => rollDie(sides)} aria-label={`Roll a d${sides}`} disabled={dice.rolling}>
              <Die sides={sides} value={`d${sides}`} size={38} active={dice.rolling && dice.sides === sides} />
            </UnstyledButton>
          ))}
        </div>
        {(dice.rolling || dice.result) && (
          <div className="tt-dice-result">
            <DiceResult result={dice.result} rolling={dice.rolling} sides={dice.sides} count={dice.count} />
          </div>
        )}
        {isDm && (
          <Switch size="xs" label="Private roll (DM only)" checked={isPrivate} onChange={(e) => setIsPrivate(e.currentTarget.checked)} />
        )}
      </Stack>
    </Stack>
  );
}

function Economy({ token, turnActive, isCurrent }: { token: TableToken; turnActive: boolean; isCurrent: boolean }) {
  const toggle = (key: "action" | "bonus" | "reaction") =>
    void tabletop.setEconomy(token.id, { ...token.economy, [key]: !token.economy[key] });
  const moved = token.economy.movedFt;
  const over = moved > token.speed;

  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
          {isCurrent ? "This turn" : "Action economy"}
        </Text>
        {turnActive && (
          <Badge size="sm" variant="light" color={over ? "red" : "gray"}>
            Moved {moved} / {token.speed} ft
          </Badge>
        )}
      </Group>
      <Group gap={6}>
        {(["action", "bonus", "reaction"] as const).map((key) => (
          <Chip key={key} size="xs" checked={token.economy[key]} onChange={() => toggle(key)} color="violet" variant="light">
            {key === "bonus" ? "Bonus action" : key[0].toUpperCase() + key.slice(1)} used
          </Chip>
        ))}
      </Group>
    </Stack>
  );
}

function Spells({ character, onRoll }: { character: Character; onRoll: (expressions: string[], label?: string) => void }) {
  const { actions, loading } = useSpellAttacks(character);
  if (!loading && actions.length === 0) return null;

  return (
    <Stack gap={6}>
      <Group gap={6}>
        <Text size="xs" fw={600} tt="uppercase" c="dimmed">
          Spells
        </Text>
        {loading && <Loader size={12} />}
      </Group>
      <Stack gap={4}>
        {actions.map((a) => (
          <UnstyledButton key={a.key} className="tt-action" onClick={() => onRoll(a.expressions, a.name)}>
            <IconWand size={14} />
            <div>
              <Text size="sm" fw={600} lh={1.2}>
                {a.name}
              </Text>
              <Text size="xs" c="dimmed" lh={1.2}>
                {a.detail}
              </Text>
            </div>
          </UnstyledButton>
        ))}
      </Stack>
    </Stack>
  );
}
