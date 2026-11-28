import { type CSSProperties, useEffect, useState } from "react";
import {
  abandonQuest,
  acceptQuest,
  getMiningState,
  type MiningConfig,
  type MiningQuest,
  type MiningState,
  type QuestNeed,
  turnInQuest,
} from "@services/miningService";
import { COIN } from "./art/materials";
import { raster } from "./art/pixel";
import { captainSprite } from "./art/npcs";
import { compact } from "./mine";
import { pushNote } from "./notes";
import { PanelHead } from "./CampMenus";
import { clock, isActive, limitText, MAX_ACTIVE, msLeft, needDone, opensIn, questDone, shortOf } from "./jobs";
import { resourceOf } from "./resources";
import { play } from "./sound";
import { Sprite } from "./Sprite";
import styles from "./Mine.module.css";

const RANKS = {
  easy: { name: "Easy", color: "#c8743a" },
  medium: { name: "Medium", color: "#9fb8d8" },
  hard: { name: "Hard", color: "#d8463a" },
};

const SKULL = raster(
  ["..xxxxx..", ".xwwwwwx.", "xwwwwwwwx", "xwkkwkkwx", "xwkkwkkwx", "xwwwkwwwx", ".xwwwwwx.", "..xwxwx..", "..xxxxx.."],
  { x: "#1c1410", w: "#e8e0d0", k: "#5a1a1a" },
);

const KIND_COLOR = { ore: "#ffd77a", alloy: "#ffb070", kill: "#ff8a6a" };

function useNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const needText = (config: MiningConfig, q: MiningQuest, n: QuestNeed) => {
  if (n.kind === "kill") return `Slay monsters on depth ${q.depth}`;
  const name = resourceOf(config, n.key).name;
  return n.kind === "alloy" ? `Smelt ${name} bars` : `Gather ${name} on depth ${q.depth}`;
};

function NeedIcon({ config, need }: { config: MiningConfig; need: QuestNeed }) {
  const grid = need.kind === "kill" ? SKULL : resourceOf(config, need.key).grid;
  return <Sprite grid={grid} scale={1} />;
}

function NeedRow({ config, quest, need, live }: { config: MiningConfig; quest: MiningQuest; need: QuestNeed; live: boolean }) {
  const done = needDone(need);
  return (
    <li className={`${styles.need} ${done ? styles.needDone : ""}`}>
      <NeedIcon config={config} need={need} />
      <span className={styles.needText}>{needText(config, quest, need)}</span>
      <span className={styles.needCount}>{live ? `${compact(need.done)} / ${compact(need.count)}` : compact(need.count)}</span>
      {live && (
        <div className={`${styles.bar} ${styles.needBar}`}>
          <div
            className={styles.needFill}
            style={{ width: `${Math.min(1, need.done / need.count) * 100}%`, "--fill": done ? "#9fe09a" : KIND_COLOR[need.kind] } as CSSProperties}
          />
        </div>
      )}
    </li>
  );
}

function Pay({ config, quest }: { config: MiningConfig; quest: MiningQuest }) {
  return (
    <div className={styles.pays}>
      <span className={styles.paysLabel}>Pays</span>
      <span className={styles.payItem}>
        <Sprite grid={COIN} scale={1} />
        {compact(quest.coins)} coins
      </span>
      {Object.entries(quest.reward).map(([key, n]) => {
        const r = resourceOf(config, key);
        return (
          <span key={key} className={styles.payItem}>
            <Sprite grid={r.grid} scale={1} />
            {compact(n)} {r.name}
          </span>
        );
      })}
    </div>
  );
}

function Contract({
  config,
  state,
  quest,
  now,
  busy,
  full,
  act,
}: {
  config: MiningConfig;
  state: MiningState;
  quest: MiningQuest;
  now: number;
  busy: boolean;
  full: boolean;
  act: (work: () => Promise<MiningState>, done: string, cue?: "buy" | "jackpot") => void;
}) {
  const rank = RANKS[quest.rank];
  const live = isActive(quest);
  const wait = opensIn(quest, now);
  if (wait > 0)
    return (
      <article
        className={`${styles.contract} ${styles.contractSealed}`}
        style={{ "--rank": rank.color } as CSSProperties}
        aria-label={`Next ${rank.name.toLowerCase()} job in ${clock(wait)}`}
      >
        <header className={styles.contractHead}>
          <span className={styles.seal} aria-hidden />
          <div>
            <b className={styles.pixel}>Next {rank.name.toLowerCase()} job</b>
            <span className={styles.contractMeta}>Morg is still writing it up.</span>
          </div>
        </header>
        <span className={styles.sealedClock}>{clock(wait)}</span>
      </article>
    );
  const left = msLeft(quest, now);
  const finished = live && questDone(quest);
  const short = finished ? shortOf(quest, state.ores) : [];
  return (
    <article
      className={`${styles.contract} ${live ? styles.contractLive : ""}`}
      style={{ "--rank": rank.color } as CSSProperties}
      aria-label={`${rank.name} job: ${quest.title}`}
    >
      <header className={styles.contractHead}>
        <span className={styles.seal} aria-hidden />
        <div>
          <b className={styles.pixel}>{quest.title}</b>
          <span className={styles.contractMeta}>
            <span style={{ color: rank.color }}>{rank.name}</span>, depth {quest.depth} {config.depths[quest.depth - 1]?.name}
          </span>
        </div>
      </header>
      <p className={styles.contractLine}>"{quest.line}"</p>
      <ul className={styles.needs}>
        {quest.needs.map((n) => (
          <NeedRow key={`${n.kind}:${n.key}`} config={config} quest={quest} need={n} live={live} />
        ))}
      </ul>
      <Pay config={config} quest={quest} />
      <div className={styles.contractFoot}>
        <span className={`${styles.timeLeft} ${live && left < 60_000 ? styles.timeLow : ""}`}>
          {live ? (left > 0 ? `${clock(left)} left` : "Time's up") : `${limitText(quest.minutes)} to finish once taken`}
        </span>
        {!live && (
          <button
            type="button"
            className={`glass-btn-primary ${styles.actBtn}`}
            disabled={busy || full}
            title={full ? `You can hold ${MAX_ACTIVE} jobs at once.` : undefined}
            onClick={() => act(() => acceptQuest(quest.id), `Job taken: ${quest.title}`)}
          >
            Take the job
          </button>
        )}
        {live && finished && (
          <button
            type="button"
            className={`glass-btn-primary ${styles.actBtn}`}
            disabled={busy || short.length > 0 || left <= 0}
            onClick={() => act(() => turnInQuest(quest.id), `Paid ${compact(quest.coins)} coins for ${quest.title}`, "jackpot")}
          >
            Hand it in
          </button>
        )}
        {live && (
          <button
            type="button"
            className={`glass-btn-secondary ${styles.actBtn}`}
            disabled={busy}
            onClick={() => act(() => abandonQuest(quest.id), `Gave up: ${quest.title}`)}
          >
            Give up
          </button>
        )}
      </div>
      {short.length > 0 && (
        <span className={styles.shortNote}>
          Your pouch is short:{" "}
          {short.map(([key, n]) => `${compact(n - (state.ores[key] ?? 0))} ${resourceOf(config, key).name}`).join(", ")}.
        </span>
      )}
    </article>
  );
}

export function ShipMenu({ config, state, onState }: { config: MiningConfig; state: MiningState; onState: (s: MiningState) => void }) {
  const now = useNow();
  const [busy, setBusy] = useState(false);
  const quests = state.quests ?? [];
  const active = quests.filter(isActive).length;
  const expired = quests.some((q) => isActive(q) && msLeft(q, now) <= 0);
  useEffect(() => {
    if (!expired || busy) return;
    let cancelled = false;
    void getMiningState()
      .then((s) => {
        if (!cancelled) onState(s);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [busy, expired, onState]);
  const act = async (work: () => Promise<MiningState>, done: string, cue: "buy" | "jackpot" = "buy") => {
    setBusy(true);
    try {
      onState(await work());
      play(cue);
      pushNote({ text: done, color: "#ffd77a" });
    } catch (e) {
      pushNote({ title: "Not now", text: (e as Error).message, color: "#ff8a6a" });
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className={styles.marketHead}>
        <Sprite grid={captainSprite()} scale={2} label="Captain Morg" />
        <p className={styles.quote}>
          "The Obsidian Gale sails when her hold is full. Bring me ore, bars and a quieter mine, and I pay in coin and
          the deep stuff. Miss the deadline and the job goes to someone else."
        </p>
        <span className={styles.purse}>
          <b className={styles.pixel}>
            {active} / {MAX_ACTIVE}
          </b>
          <span className={styles.dim}>jobs taken</span>
        </span>
      </div>
      <span className={styles.dim}>
        Ore and kills count on the job's depth after you take it. Bars count when you smelt them. Morg takes the ore
        and bars at hand-in. {state.questsDone ? `Jobs finished so far: ${state.questsDone}.` : ""}
      </span>
      <div className={styles.contracts}>
        {quests.map((q) => (
          <Contract
            key={q.id}
            config={config}
            state={state}
            quest={q}
            now={now}
            busy={busy}
            full={active >= MAX_ACTIVE}
            act={(w, d, c) => void act(w, d, c)}
          />
        ))}
      </div>
    </>
  );
}

export function QuestTracker({
  config,
  state,
  onClose,
}: {
  config: MiningConfig;
  state: MiningState;
  onClose: () => void;
}) {
  const now = useNow();
  const active = (state.quests ?? []).filter(isActive);
  return (
    <section className={`${styles.hudPanel} ${styles.tracker}`} aria-label="Captain Morg's jobs">
      <PanelHead title="Morg's jobs" onClose={onClose} />
      {active.map((q) => {
        const left = msLeft(q, now);
        const finished = questDone(q);
        return (
          <div key={q.id} className={styles.trackQuest} style={{ "--rank": RANKS[q.rank].color } as CSSProperties}>
            <div className={styles.barHead}>
              <b className={styles.pixel}>{q.title}</b>
              <span className={`${styles.timeLeft} ${left < 60_000 ? styles.timeLow : ""}`}>
                {left > 0 ? clock(left) : "Time's up"}
              </span>
            </div>
            <ul className={styles.needs}>
              {q.needs.map((n) => (
                <NeedRow key={`${n.kind}:${n.key}`} config={config} quest={q} need={n} live />
              ))}
            </ul>
            {finished && left > 0 && <span className={styles.goalNote}>Done! Hand it in to Captain Morg at the docks.</span>}
          </div>
        );
      })}
    </section>
  );
}
