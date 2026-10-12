import type { CSSProperties } from "react";
import { Avatar, Menu } from "@mantine/core";
import {
  IconCopy,
  IconDice5,
  IconDroplet,
  IconEdit,
  IconHeartPlus,
  IconPhoto,
  IconPlayerTrackNext,
  IconSparkles,
  IconStack2,
  IconTrash,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useDmView, useTabletopStore } from "@store/tabletop/tabletopStore";
import { resolveImageUrl, tabletop } from "@features/tabletop/useTabletopHub";
import { LAYERS } from "@features/tabletop/tools";

const MENU_CLASSES = { dropdown: "tt-menu", item: "tt-menu-item", itemSection: "tt-menu-icon", divider: "tt-menu-divider" };

/** Right-click menu on a token: the DM's everyday token actions in one place; players only get "View image". */
export function TokenMenu() {
  const menu = useTabletopStore((s) => s.tokenMenu);
  const token = useTabletopStore((s) => s.snapshot?.tokens.find((t) => t.id === s.tokenMenu?.tokenId));
  const turn = useTabletopStore((s) => s.snapshot?.turn);
  const cellSize = useTabletopStore((s) => s.snapshot?.grid.cellSize ?? 50);
  const set = useTabletopStore((s) => s.set);
  const dmView = useDmView();
  if (!menu || !token || !turn) return null;

  const close = () => set({ tokenMenu: null });
  const dialog = (kind: "heal" | "damage" | "condition") => set({ tokenDialog: { tokenId: token.id, kind } });
  const image = resolveImageUrl(token.imageUrl);
  const hpPct = token.maxHp > 0 ? Math.max(0, Math.min(1, token.hp / token.maxHp)) : 0;
  const layer = LAYERS.find((l) => l.layer === token.layer);

  return (
    <Menu
      opened
      onChange={(opened) => !opened && close()}
      position="bottom-start"
      offset={4}
      width={dmView ? 248 : 208}
      withinPortal
      classNames={MENU_CLASSES}
      transitionProps={{ transition: "pop-top-left", duration: 120 }}
    >
      <Menu.Target>
        {/* Zero-size anchor at the click point. */}
        <div style={{ position: "fixed", left: menu.x, top: menu.y, width: 0, height: 0 }} />
      </Menu.Target>
      <Menu.Dropdown>
        <div className="tt-menu-head" style={{ "--token": token.color } as CSSProperties}>
          <Avatar src={image} size={34} radius="xl" className="tt-menu-avatar" style={{ background: token.color }}>
            {token.name.slice(0, 2).toUpperCase()}
          </Avatar>
          <div className="tt-menu-title">
            <strong>{token.name}</strong>
            {dmView ? (
              <span>
                HP {token.hp}/{token.maxHp}
                {token.tempHp > 0 && ` +${token.tempHp}`} · AC {token.ac}
                {token.layer !== "Token" && layer && ` · ${layer.label} layer`}
              </span>
            ) : (
              token.health && <span>{token.health}</span>
            )}
          </div>
        </div>
        {dmView && (
          <div className="tt-menu-hp">
            <span style={{ width: `${hpPct * 100}%` }} className={hpPct <= 0.25 ? "low" : hpPct <= 0.5 ? "mid" : undefined} />
          </div>
        )}

        {dmView && (
          <div className="tt-menu-quick">
            <Menu.Item className="tt-menu-tile damage" onClick={() => dialog("damage")}>
              <IconDroplet size={18} />
              Damage
            </Menu.Item>
            <Menu.Item className="tt-menu-tile heal" onClick={() => dialog("heal")}>
              <IconHeartPlus size={18} />
              Heal
            </Menu.Item>
            <Menu.Item className="tt-menu-tile condition" onClick={() => dialog("condition")}>
              <IconSparkles size={18} />
              Condition
            </Menu.Item>
          </div>
        )}

        {image && (
          <Menu.Item leftSection={<IconPhoto size={16} />} onClick={() => set({ imagePreview: { url: image, name: token.name } })}>
            View image
          </Menu.Item>
        )}
        {dmView && (
          <>
            <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => set({ editingTokenId: token.id })}>
              Edit token…
            </Menu.Item>
            {token.characterId && (
              <Menu.Item leftSection={<IconUser size={16} />} onClick={() => set({ profileCharacterId: token.characterId })}>
                Character sheet
              </Menu.Item>
            )}

            <Menu.Divider />
            {token.initiative === null ? (
              <Menu.Item leftSection={<IconDice5 size={16} />} onClick={() => void tabletop.setInitiative(token.id, null)}>
                Roll initiative
              </Menu.Item>
            ) : (
              <Menu.Item leftSection={<IconX size={16} />} onClick={() => void tabletop.patchToken(token, { initiative: null })}>
                Remove from initiative
              </Menu.Item>
            )}
            {turn.active && token.initiative !== null && turn.currentTokenId !== token.id && (
              <Menu.Item leftSection={<IconPlayerTrackNext size={16} />} onClick={() => void tabletop.setTurn(token.id)}>
                Give the turn
              </Menu.Item>
            )}
            <Menu.Sub position="right-start" offset={6}>
              <Menu.Sub.Target>
                <Menu.Sub.Item leftSection={<IconStack2 size={16} />}>Move to layer</Menu.Sub.Item>
              </Menu.Sub.Target>
              <Menu.Sub.Dropdown>
                {LAYERS.map(({ layer, icon: LayerIcon, label }) => (
                  <Menu.Item
                    key={layer}
                    leftSection={<LayerIcon size={16} />}
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
                leftSection={<IconCopy size={16} />}
                onClick={() => void tabletop.upsertToken({ ...token, id: undefined, initiative: null, x: token.x + cellSize, y: token.y })}
              >
                Duplicate
              </Menu.Item>
            )}

            <Menu.Divider />
            <Menu.Item className="danger" leftSection={<IconTrash size={16} />} onClick={() => void tabletop.removeToken(token.id)}>
              Delete token
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
