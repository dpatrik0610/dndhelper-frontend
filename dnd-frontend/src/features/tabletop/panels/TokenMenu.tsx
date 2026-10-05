import { Menu } from "@mantine/core";
import {
  IconCopy,
  IconDice5,
  IconDroplet,
  IconEdit,
  IconHeartPlus,
  IconPlayerTrackNext,
  IconSparkles,
  IconStack2,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import { tabletop } from "@features/tabletop/useTabletopHub";
import { LAYERS } from "@features/tabletop/tools";

/** The DM's right-click menu on a token: the token's everyday actions in one place. */
export function TokenMenu() {
  const menu = useTabletopStore((s) => s.tokenMenu);
  const token = useTabletopStore((s) => s.snapshot?.tokens.find((t) => t.id === s.tokenMenu?.tokenId));
  const turn = useTabletopStore((s) => s.snapshot?.turn);
  const cellSize = useTabletopStore((s) => s.snapshot?.grid.cellSize ?? 50);
  const set = useTabletopStore((s) => s.set);
  if (!menu || !token || !turn) return null;

  const close = () => set({ tokenMenu: null });
  const dialog = (kind: "heal" | "damage" | "condition") => set({ tokenDialog: { tokenId: token.id, kind } });

  return (
    <Menu opened onChange={(opened) => !opened && close()} position="bottom-start" offset={2} shadow="xl" radius="md" width={220} withinPortal>
      <Menu.Target>
        {/* Zero-size anchor at the click point. */}
        <div style={{ position: "fixed", left: menu.x, top: menu.y, width: 0, height: 0 }} />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{token.name}</Menu.Label>
        <Menu.Item leftSection={<IconEdit size={15} />} onClick={() => set({ editingTokenId: token.id })}>
          Edit token…
        </Menu.Item>
        {token.characterId && (
          <Menu.Item leftSection={<IconUser size={15} />} onClick={() => set({ profileCharacterId: token.characterId })}>
            Character sheet
          </Menu.Item>
        )}

        <Menu.Divider />
        <Menu.Item leftSection={<IconDroplet size={15} />} color="red" onClick={() => dialog("damage")}>
          Damage…
        </Menu.Item>
        <Menu.Item leftSection={<IconHeartPlus size={15} />} color="teal" onClick={() => dialog("heal")}>
          Heal…
        </Menu.Item>
        <Menu.Item leftSection={<IconSparkles size={15} />} onClick={() => dialog("condition")}>
          Add condition…
        </Menu.Item>

        <Menu.Divider />
        {token.initiative === null ? (
          <Menu.Item leftSection={<IconDice5 size={15} />} onClick={() => void tabletop.setInitiative(token.id, null)}>
            Roll initiative
          </Menu.Item>
        ) : (
          <Menu.Item leftSection={<IconX size={15} />} onClick={() => void tabletop.patchToken(token, { initiative: null })}>
            Remove from initiative
          </Menu.Item>
        )}
        {turn.active && token.initiative !== null && turn.currentTokenId !== token.id && (
          <Menu.Item leftSection={<IconPlayerTrackNext size={15} />} onClick={() => void tabletop.setTurn(token.id)}>
            Give the turn
          </Menu.Item>
        )}

        <Menu.Divider />
        <Menu.Sub position="right-start" offset={4}>
          <Menu.Sub.Target>
            <Menu.Sub.Item leftSection={<IconStack2 size={15} />}>Move to layer</Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
            {LAYERS.map(({ layer, icon: LayerIcon, label }) => (
              <Menu.Item
                key={layer}
                leftSection={<LayerIcon size={15} />}
                disabled={token.layer === layer}
                onClick={() => void tabletop.patchToken(token, { layer })}
              >
                {label}
              </Menu.Item>
            ))}
          </Menu.Sub.Dropdown>
        </Menu.Sub>
        {/* A character has one token; copies are for monsters and NPCs. */}
        {!token.characterId && (
          <Menu.Item
            leftSection={<IconCopy size={15} />}
            onClick={() => void tabletop.upsertToken({ ...token, id: undefined, initiative: null, x: token.x + cellSize, y: token.y })}
          >
            Duplicate
          </Menu.Item>
        )}
        <Menu.Item leftSection={<IconTrash size={15} />} color="red" onClick={() => void tabletop.removeToken(token.id)}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
