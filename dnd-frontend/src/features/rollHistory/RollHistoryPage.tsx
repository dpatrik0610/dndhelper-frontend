import { useCallback, useEffect, useRef, useState } from "react";
import { SegmentedControl, Text } from "@mantine/core";
import { IconDice5, IconEyeOff, IconRefresh } from "@tabler/icons-react";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import { showNotification } from "@components/Notification/Notification";
import { ListSkeleton } from "@components/common/Skeletons";
import { Die } from "@components/roll/Dice";
import { RollDetailsModal, type RollDetails } from "@components/roll/RollDetailsModal";
import { useCurrentUserId } from "@store/auth/authSelectors";
import { useCurrentCampaign, useIsDm } from "@store/campaign/campaignSelectors";
import { getRollHistory } from "@services/rollService";
import { RollType, type RollHistoryEntry } from "@appTypes/Roll";
import { SectionColor } from "@appTypes/SectionColor";
import { formatRollExpression } from "@utils/rollFormat";
import classes from "./RollHistory.module.css";

const PAGE_SIZE = 40;
const MAX_FACES = 8;

type Filter = "all" | "public" | "subtle";
const FILTER_TYPE: Record<Filter, RollType | undefined> = {
  all: undefined,
  public: RollType.Public,
  subtle: RollType.Subtle,
};

const who = (e: RollHistoryEntry) => e.characterName || e.username || "Unknown";

const dayLabel = (date: Date) => {
  const day = new Date(date).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  if (day === today) return "Today";
  if (day === today - 86_400_000) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
};

const natural = (e: RollHistoryEntry) =>
  e.numberOfDice === 1 && e.sides === 20 ? (e.rolls[0] === 20 ? "crit" : e.rolls[0] === 1 ? "fumble" : null) : null;

const toDetails = (e: RollHistoryEntry): RollDetails => ({
  id: e.id ?? `${e.createdAt}-${e.total}`,
  who: who(e),
  by: e.username,
  at: e.createdAt,
  note: e.note,
  subtle: e.type === RollType.Subtle,
  result: e,
});

export default function RollHistoryPage() {
  const me = useCurrentUserId();
  const campaign = useCurrentCampaign();
  const campaignId = campaign?.id ?? null;
  const isDm = useIsDm() && campaignId != null;
  const { connection } = useSignalRConnection();

  const [filter, setFilter] = useState<Filter>("all");
  const [entries, setEntries] = useState<RollHistoryEntry[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<RollDetails | null>(null);
  // Bumped on every reload so a slow response for an old campaign/filter is dropped.
  const generation = useRef(0);

  const load = useCallback(
    async (pageToLoad: number) => {
      const gen = pageToLoad === 1 ? ++generation.current : generation.current;
      setLoading(true);
      try {
        const items = await getRollHistory(pageToLoad, PAGE_SIZE, FILTER_TYPE[filter]);
        if (gen !== generation.current) return;
        setEntries((prev) => {
          if (pageToLoad === 1) return items;
          const seen = new Set(prev.map((e) => e.id));
          return [...prev, ...items.filter((e) => !seen.has(e.id))];
        });
        setPage(pageToLoad);
        setHasMore(items.length === PAGE_SIZE);
      } catch (error) {
        if (gen !== generation.current) return;
        const status = (error as { status?: number })?.status;
        showNotification({
          title: status === 401 || status === 403 ? "Access denied" : "Load failed",
          message: status === 401 || status === 403 ? "You can't view this roll log." : "Could not load roll history.",
          color: SectionColor.Red,
        });
      } finally {
        if (gen === generation.current) setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    setEntries([]);
    setHasMore(false);
    void load(1);
  }, [load, campaignId]);

  // Live: the server pushes each new roll to whoever may see it.
  useEffect(() => {
    if (!connection) return;
    const onRoll = (roll: RollHistoryEntry) => {
      const inScope = campaignId ? roll.campaignId === campaignId : roll.userId === me;
      const type = FILTER_TYPE[filter];
      if (!inScope || (type != null && roll.type !== type)) return;
      setEntries((prev) => (prev.some((e) => e.id === roll.id) ? prev : [roll, ...prev]));
    };
    connection.on("RollRecorded", onRoll);
    return () => connection.off("RollRecorded", onRoll);
  }, [connection, campaignId, me, filter]);

  const subtitle = !campaignId
    ? "Your own rolls. Select a campaign to see the party's."
    : isDm
      ? `Every roll in ${campaign?.name}, subtle ones included.`
      : `The party's rolls in ${campaign?.name}, plus your own subtle ones.`;

  let lastDay = "";

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <span className={classes.headerIcon}>
          <IconDice5 size={22} stroke={1.75} />
        </span>
        <div className={classes.headerText}>
          <h1 className={`${classes.title} narrative-title`} data-themed>
            Roll Log
          </h1>
          <p className={classes.subtitle}>{subtitle}</p>
        </div>
        <button
          type="button"
          className={classes.iconButton}
          onClick={() => void load(1)}
          disabled={loading}
          aria-label="Refresh"
          title="Refresh"
        >
          <IconRefresh size={18} className={loading ? classes.spin : undefined} />
        </button>
      </header>

      <SegmentedControl
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        data={[
          { label: "All", value: "all" },
          { label: "Public", value: "public" },
          { label: "Subtle", value: "subtle" },
        ]}
        size="xs"
        classNames={{ root: `glassy-segmented ${classes.filter}`, control: "glassy-segmented__control", label: "glassy-segmented__label" }}
      />

      <div className={classes.panel}>
        {loading && entries.length === 0 ? (
          <ListSkeleton rows={6} height={58} />
        ) : entries.length === 0 ? (
          <div className={classes.empty}>
            <IconDice5 size={36} className={classes.emptyIcon} />
            <Text fw={600}>No rolls yet</Text>
            <Text size="xs" className={classes.muted}>
              {filter === "subtle" ? "No subtle rolls here." : "Rolls made from a character sheet show up here."}
            </Text>
          </div>
        ) : (
          entries.map((e) => {
            const at = e.createdAt ? new Date(e.createdAt) : null;
            const day = at ? dayLabel(at) : "";
            const showDay = day !== lastDay;
            lastDay = day;
            const subtle = e.type === RollType.Subtle;
            const nat = natural(e);
            const hidden = e.rolls.length - MAX_FACES;

            return (
              <div key={e.id ?? `${e.createdAt}-${e.total}`}>
                {showDay && day && <div className={classes.day}>{day}</div>}
                <button
                  type="button"
                  className={`${classes.row} ${subtle ? classes.rowSubtle : ""} ${e.userId === me ? classes.rowMine : ""}`}
                  onClick={() => setSelected(toDetails(e))}
                >
                  <span className={`${classes.total} ${nat ? classes[nat] : ""}`}>{e.total}</span>

                  <span className={classes.body}>
                    <span className={classes.who}>
                      <span className={classes.name}>{who(e)}</span>
                      {e.characterName && e.username && <span className={classes.muted}>{e.username}</span>}
                      {subtle && (
                        <span className={classes.subtleTag}>
                          <IconEyeOff size={11} /> Subtle
                        </span>
                      )}
                    </span>
                    <span className={classes.dice}>
                      <span className={classes.expr}>{formatRollExpression(e)}</span>
                      {e.rolls.slice(0, MAX_FACES).map((face, i) => (
                        <Die
                          key={i}
                          sides={e.sides}
                          value={face}
                          size={22}
                          className={nat ? `die--${nat}` : face === e.sides ? "die--active" : undefined}
                        />
                      ))}
                      {hidden > 0 && <span className={classes.muted}>+{hidden}</span>}
                    </span>
                    {e.note && <span className={classes.note}>“{e.note}”</span>}
                  </span>

                  {at && (
                    <time className={classes.time} dateTime={e.createdAt!} title={at.toLocaleString()}>
                      {at.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </time>
                  )}
                </button>
              </div>
            );
          })
        )}

        {hasMore && (
          <button
            type="button"
            className={`glass-btn-secondary ${classes.more}`}
            onClick={() => void load(page + 1)}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load older rolls"}
          </button>
        )}
      </div>

      <RollDetailsModal details={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
