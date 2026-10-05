import type { CSSProperties } from "react";
import { ActionIcon, Avatar, Button, NumberInput, ScrollArea, Text, Tooltip } from "@mantine/core";
import {
  IconDroplet,
  IconEyeOff,
  IconHeartPlus,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlayerTrackNext,
  IconPlus,
  IconShield,
  IconSkull,
  IconSwords,
  IconX,
} from "@tabler/icons-react";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { initiativeOrder, useDmView, useTabletopStore } from "@store/tabletop/tabletopStore";
import type { TableToken } from "@appTypes/Tabletop";
import { resolveImageUrl, tabletop } from "@features/tabletop/useTabletopHub";

const update = (token: TableToken, patch: Partial<TableToken>) => void tabletop.patchToken(token, patch);

const HEALTH_TONE: Record<string, string> = { Healthy: "healthy", Wounded: "wounded", Bloodied: "bloodied", Down: "down" };

/** Initiative table: everyone sees it, only the DM edits it. */
export function InitiativePanel() {
  const me = useCurrentUserId() ?? "";
  const session = useTabletopStore((s) => s.session);
  const snapshot = useTabletopStore((s) => s.snapshot);
  const dmView = useDmView();

  if (!session || !snapshot) return null;
  const { turn } = snapshot;
  // The DM edits everything; players (and the DM's player preview) see no DM-layer tokens.
  const isDm = dmView;
  const tokens = isDm ? snapshot.tokens : snapshot.tokens.filter((t) => t.layer !== "Dm");
  const order = initiativeOrder(tokens);
  const waiting = isDm ? tokens.filter((t) => t.initiative === null) : [];

  const currentIndex = turn.active ? order.findIndex((t) => t.id === turn.currentTokenId) : -1;
  const nextId = turn.active && order.length > 1 ? order[(currentIndex + 1) % order.length]?.id : null;

  const rowProps = (t: TableToken) => ({
    token: t,
    isDm,
    mine: t.ownerIds.includes(me),
    current: turn.active && turn.currentTokenId === t.id,
    next: t.id === nextId,
    combat: turn.active,
    onHp: (kind: "heal" | "damage") => useTabletopStore.getState().set({ tokenDialog: { tokenId: t.id, kind } }),
    onAddEffect: () => useTabletopStore.getState().set({ tokenDialog: { tokenId: t.id, kind: "condition" } }),
  });

  return (
    <div className="tt-initiative">
      <header className="tt-init-head">
        <div className="tt-init-title">
          <span className="tt-init-title-icon">
            <IconSwords size={15} />
          </span>
          <div>
            <Text fw={800} size="sm" lh={1.1}>
              Initiative
            </Text>
            <Text size="xs" c="dimmed" lh={1.2}>
              {turn.active
                ? `Round ${turn.round} · Turn ${Math.max(1, currentIndex + 1)} of ${order.length}`
                : order.length
                  ? `${order.length} ready`
                  : "Out of combat"}
            </Text>
          </div>
        </div>
        {isDm &&
          (turn.active ? (
            <div className="tt-init-head-actions">
              <Button size="compact-sm" radius="xl" className="tt-init-next" leftSection={<IconPlayerTrackNext size={14} />} onClick={() => void tabletop.endTurn()}>
                Next
              </Button>
              <Tooltip label="End combat">
                <ActionIcon size="md" radius="xl" variant="subtle" color="red" onClick={() => void tabletop.endCombat()} aria-label="End combat">
                  <IconPlayerStop size={15} />
                </ActionIcon>
              </Tooltip>
            </div>
          ) : (
            <Button
              size="compact-sm"
              radius="xl"
              variant="light"
              color="yellow"
              leftSection={<IconPlayerPlay size={14} />}
              disabled={order.length === 0}
              onClick={() => void tabletop.startCombat()}
            >
              Start combat
            </Button>
          ))}
      </header>

      {turn.active && order.length > 0 && (
        <div className="tt-init-progress" aria-hidden>
          {order.map((t, i) => (
            <span key={t.id} className={i < currentIndex ? "done" : i === currentIndex ? "now" : undefined} />
          ))}
        </div>
      )}

      <ScrollArea className="tt-scroll" type="auto">
        <div className="tt-init-list">
          {order.length === 0 && (
            <div className="tt-init-empty">
              <IconSwords size={22} />
              <span>{isDm ? "Give a token an initiative below to add it to the order." : "No one has rolled initiative yet."}</span>
            </div>
          )}
          {order.map((t) => (
            <InitiativeRow key={t.id} {...rowProps(t)} />
          ))}
          {waiting.length > 0 && (
            <>
              <div className="tt-init-divider">Not in initiative</div>
              {waiting.map((t) => (
                <InitiativeRow key={t.id} {...rowProps(t)} />
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function InitiativeRow({
  token: t,
  isDm,
  mine,
  current,
  next,
  combat,
  onHp,
  onAddEffect,
}: {
  token: TableToken;
  isDm: boolean;
  mine: boolean;
  current: boolean;
  next: boolean;
  combat: boolean;
  onHp: (mode: "heal" | "damage") => void;
  onAddEffect: () => void;
}) {
  // Players get numbers for player characters only; monsters and NPCs show a health word instead.
  const redacted = !isDm && t.characterId === null;
  const hpRatio = t.maxHp > 0 ? Math.max(0, Math.min(1, t.hp / t.maxHp)) : null;
  const down = redacted ? t.health === "Down" : t.maxHp > 0 && t.hp <= 0;
  const clickable = isDm || (mine && !!t.characterId);
  const open = () => {
    const store = useTabletopStore.getState();
    if (isDm) store.set({ editingTokenId: t.id });
    else if (mine && t.characterId) store.set({ profileCharacterId: t.characterId });
  };
  const hpTone = hpRatio === null ? "" : hpRatio > 0.5 ? "healthy" : hpRatio > 0.25 ? "wounded" : "bloodied";

  return (
    <div
      className={[
        "tt-init-row",
        current && "current",
        next && "next",
        mine && "mine",
        down && "down",
        t.layer === "Dm" && "hidden",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--token": t.color } as CSSProperties}
    >
      <div className="tt-init-main">
        <div className="tt-init-score">
          {isDm ? (
            <InlineNumber value={t.initiative} placeholder="–" onCommit={(initiative) => update(t, { initiative })} allowEmpty />
          ) : (
            <span>{t.initiative ?? "–"}</span>
          )}
        </div>

        <UnstyledAvatar token={t} onClick={clickable ? open : undefined} down={down} />

        <div className="tt-init-who">
          <div className="tt-init-name-row">
            <Text
              size="sm"
              fw={700}
              truncate
              className={clickable ? "tt-init-name clickable" : "tt-init-name"}
              onClick={clickable ? open : undefined}
            >
              {t.name}
            </Text>
            {current && <span className="tt-tag now">Now</span>}
            {next && !current && <span className="tt-tag next">Next</span>}
            {mine && <span className="tt-tag you">You</span>}
            {t.layer === "Dm" && (
              <Tooltip label="On the DM layer: players can't see it">
                <IconEyeOff size={13} className="tt-init-dm" />
              </Tooltip>
            )}
          </div>

          {redacted ? (
            t.health && <span className={`tt-health ${HEALTH_TONE[t.health] ?? ""}`}>{t.health}</span>
          ) : (
            <div className="tt-hp">
              <div className="tt-hp-bar">
                {hpRatio !== null && <div className={`tt-hp-fill ${hpTone}`} style={{ width: `${hpRatio * 100}%` }} />}
                {t.tempHp > 0 && t.maxHp > 0 && (
                  <div className="tt-hp-temp-fill" style={{ width: `${Math.min(1, t.tempHp / t.maxHp) * 100}%` }} />
                )}
              </div>
              <span className="tt-hp-text">
                {t.hp}
                {t.maxHp > 0 && <span className="tt-hp-max">/{t.maxHp}</span>}
                {t.tempHp > 0 && <span className="tt-hp-temp"> +{t.tempHp}</span>}
              </span>
            </div>
          )}
        </div>

        {!redacted && (
          <Tooltip label="Armor class">
            <div className="tt-init-ac">
              <IconShield size={30} stroke={1.4} className="tt-init-ac-shield" />
              {isDm ? (
                <InlineNumber value={t.ac} onCommit={(ac) => update(t, { ac: ac ?? 0 })} />
              ) : (
                <span>{t.ac}</span>
              )}
            </div>
          </Tooltip>
        )}
      </div>

      {(t.effects.length > 0 || isDm) && (
        <div className="tt-init-sub">
          {t.effects.map((e) => (
            <span key={e.id} className="tt-effect">
              {e.label}
              {e.remaining !== null && <span className="tt-effect-count">{e.remaining}</span>}
              {isDm && (
                <button
                  type="button"
                  className="tt-effect-x"
                  onClick={() => update(t, { effects: t.effects.filter((x) => x.id !== e.id) })}
                  aria-label={`Remove ${e.label}`}
                >
                  <IconX size={10} />
                </button>
              )}
            </span>
          ))}
          {isDm && (
            <div className="tt-init-tools">
              <Tooltip label="Add effect">
                <ActionIcon size="sm" radius="xl" variant="subtle" color="grape" onClick={onAddEffect} aria-label="Add effect">
                  <IconPlus size={13} />
                </ActionIcon>
              </Tooltip>
              {!redacted && (
                <>
                  <Tooltip label="Damage">
                    <ActionIcon size="sm" radius="xl" variant="subtle" color="red" onClick={() => onHp("damage")} aria-label="Damage">
                      <IconDroplet size={13} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Heal">
                    <ActionIcon size="sm" radius="xl" variant="subtle" color="teal" onClick={() => onHp("heal")} aria-label="Heal">
                      <IconHeartPlus size={13} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
              {combat && t.initiative !== null && !current && (
                <Tooltip label="Give this token the turn">
                  <ActionIcon size="sm" radius="xl" variant="subtle" color="yellow" onClick={() => void tabletop.setTurn(t.id)} aria-label="Give the turn">
                    <IconPlayerPlay size={13} />
                  </ActionIcon>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UnstyledAvatar({ token: t, onClick, down }: { token: TableToken; onClick?: () => void; down: boolean }) {
  return (
    <div className={`tt-init-avatar${onClick ? " clickable" : ""}`} onClick={onClick}>
      <Avatar src={resolveImageUrl(t.imageUrl)} size={36} radius="xl" style={{ background: t.color }}>
        {t.name.slice(0, 2).toUpperCase()}
      </Avatar>
      {down && (
        <span className="tt-init-down">
          <IconSkull size={12} />
        </span>
      )}
    </div>
  );
}

/** Commits on blur/Enter instead of every keystroke, so typing "15" doesn't send "1" first. */
function InlineNumber({
  value,
  onCommit,
  placeholder,
  allowEmpty,
}: {
  value: number | null;
  onCommit: (value: number | null) => void;
  placeholder?: string;
  allowEmpty?: boolean;
}) {
  return (
    <NumberInput
      key={value ?? "empty"}
      defaultValue={value ?? ""}
      placeholder={placeholder}
      size="xs"
      hideControls
      variant="unstyled"
      allowDecimal={false}
      classNames={{ input: "tt-inline-number" }}
      onBlur={(e) => {
        const raw = e.currentTarget.value.trim();
        const next = raw === "" ? (allowEmpty ? null : value) : Number(raw);
        if (next !== value && (next === null || Number.isFinite(next))) onCommit(next);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}
