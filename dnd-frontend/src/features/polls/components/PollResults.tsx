import { useState, type CSSProperties } from "react";
import { RingProgress } from "@mantine/core";
import { AreaChart, BarChart, DonutChart } from "@mantine/charts";
import "@mantine/charts/styles.css";
import { IconChartBar, IconCrown, IconHourglass, IconLock, IconUserQuestion } from "@tabler/icons-react";
import dayjs from "dayjs";
import { isPollOpen, type Poll } from "@appTypes/Poll";
import { CustomSelect } from "@components/common/CustomSelect";
import { leaderIds, optionColor, percentFor, votesFor } from "@features/polls/pollUtils";
import classes from "@features/polls/Polls.module.css";

const TEXT = "color-mix(in srgb, var(--theme-color-text-primary) 70%, transparent)";
const GRID = "color-mix(in srgb, var(--theme-color-text-primary) 10%, transparent)";
const clip = (text: string, max = 22) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

export function PollResults({ polls }: { polls: Poll[] }) {
  // Only polls whose standings this user may see; closed ones first, newest first within.
  const visible = polls
    .filter((p) => !p.resultsHidden && p.tally)
    .sort((a, b) => Number(isPollOpen(a)) - Number(isPollOpen(b)));
  const [pickedId, setPickedId] = useState<string | null>(null);
  const poll = visible.find((p) => p.id === pickedId) ?? visible[0];

  if (!poll) {
    return (
      <div className={`${classes.panel} ${classes.empty}`}>
        <IconChartBar size={34} className={classes.emptyIcon} />
        <p className={classes.muted}>No results to show yet. Sealed polls appear here once they close.</p>
      </div>
    );
  }

  const leaders = leaderIds(poll);
  const turnout = poll.memberCount ? Math.round((poll.voterCount * 100) / poll.memberCount) : 0;
  const totalPicks = poll.options.reduce((sum, o) => sum + votesFor(poll, o.id), 0);
  const colored = poll.options.map((o, i) => ({ ...o, color: optionColor(i, poll.options.length) }));
  const optionById = new Map(colored.map((o) => [o.id, o]));
  const topVotes = leaders.length ? votesFor(poll, leaders[0]) : 0;

  // One stacked series per option, each row filling only its own: every bar gets its option's color.
  const barData = colored.map((o) => ({ option: clip(o.text), [o.id]: votesFor(poll, o.id) }));
  const donutData = colored
    .filter((o) => votesFor(poll, o.id) > 0)
    .map((o) => ({ name: clip(o.text, 40), value: votesFor(poll, o.id), color: o.color }));
  // Cumulative turnout over time; only for polls that show who voted when.
  const timeline = (poll.voters ?? [])
    .slice()
    .sort((a, b) => a.votedAt.localeCompare(b.votedAt))
    .map((v, i) => ({ time: dayjs(v.votedAt).format("MMM D HH:mm"), voters: i + 1 }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className={classes.panel}>
        <CustomSelect
          label="Poll"
          value={poll.id}
          onChange={setPickedId}
          data={visible.map((p) => ({ value: p.id, label: `${p.title}${isPollOpen(p) ? " (live)" : ""}` }))}
        />
      </div>

      <div className={classes.stats}>
        <div className={classes.stat}>
          <RingProgress
            size={64}
            thickness={6}
            roundCaps
            sections={[{ value: turnout, color: "var(--theme-color-accent-secondary)" }]}
            rootColor={GRID}
            label={<div style={{ textAlign: "center", fontSize: 12, fontWeight: 700 }}>{turnout}%</div>}
          />
          <div>
            <p className={classes.statLabel}>Turnout</p>
            <p className={classes.statValue}>
              {poll.voterCount} / {poll.memberCount}
            </p>
          </div>
        </div>

        <div className={classes.stat}>
          <IconCrown size={30} color="var(--theme-color-accent-primary)" />
          <div style={{ minWidth: 0 }}>
            <p className={classes.statLabel}>{isPollOpen(poll) ? "Leading" : leaders.length > 1 ? "Tied" : "Winner"}</p>
            <p className={`${classes.statValue} ${classes.statValueAccent}`}>
              {leaders.length ? leaders.map((id) => optionById.get(id)?.text).join(" · ") : "No votes yet"}
            </p>
            {topVotes > 0 && (
              <p className={`${classes.subtitle} ${classes.muted}`}>
                {topVotes} vote{topVotes === 1 ? "" : "s"} · {percentFor(poll, leaders[0])}% of voters
              </p>
            )}
          </div>
        </div>

        <div className={classes.stat}>
          {isPollOpen(poll) ? (
            <IconHourglass size={30} color="var(--theme-color-accent-secondary)" />
          ) : (
            <IconLock size={30} color="var(--theme-color-accent-secondary)" />
          )}
          <div>
            <p className={classes.statLabel}>Status</p>
            <p className={classes.statValue}>{isPollOpen(poll) ? "Live" : "Closed"}</p>
            <p className={`${classes.subtitle} ${classes.muted}`}>
              {poll.closedAt
                ? `Closed ${dayjs(poll.closedAt).format("MMM D, HH:mm")}`
                : poll.closesAt
                  ? `Closes ${dayjs(poll.closesAt).format("MMM D, HH:mm")}`
                  : `${totalPicks} pick${totalPicks === 1 ? "" : "s"} so far`}
            </p>
          </div>
        </div>
      </div>

      <div className={classes.charts}>
        <section className={classes.panel}>
          <h4 className={classes.chartTitle}>Votes per option</h4>
          <BarChart
            h={Math.max(160, poll.options.length * 46)}
            data={barData}
            dataKey="option"
            orientation="vertical"
            type="stacked"
            series={colored.map((o) => ({ name: o.id, label: clip(o.text, 40), color: o.color }))}
            barProps={{ radius: 6 }}
            textColor={TEXT}
            gridColor={GRID}
            gridAxis="none"
            yAxisProps={{ width: 130 }}
            xAxisProps={{ allowDecimals: false }}
            tooltipProps={{ cursor: { fill: "var(--theme-bg-hover)" } }}
          />
        </section>

        <section className={classes.panel}>
          <h4 className={classes.chartTitle}>Share of the vote</h4>
          {donutData.length ? (
            <>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <DonutChart
                  data={donutData}
                  size={190}
                  thickness={26}
                  paddingAngle={3}
                  strokeWidth={0}
                  chartLabel={`${totalPicks} vote${totalPicks === 1 ? "" : "s"}`}
                  tooltipDataSource="segment"
                />
              </div>
              <div className={classes.legend}>
                {colored.map((o) => (
                  <div key={o.id} className={classes.legendRow}>
                    <span className={classes.legendDot} style={{ background: o.color }} />
                    <span className={classes.legendText}>{o.text}</span>
                    <strong>{percentFor(poll, o.id)}%</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={classes.muted}>No votes yet.</p>
          )}
        </section>
      </div>

      {poll.anonymous ? (
        <div className={classes.notice}>
          <IconUserQuestion size={16} /> Anonymous poll: individual ballots are sealed for everyone.
        </div>
      ) : (
        poll.voters &&
        poll.voters.length > 0 && (
          <div className={classes.charts}>
            {timeline.length > 1 && (
              <section className={classes.panel}>
                <h4 className={classes.chartTitle}>Turnout over time</h4>
                <AreaChart
                  h={200}
                  data={timeline}
                  dataKey="time"
                  series={[{ name: "voters", label: "Voters", color: "var(--theme-color-accent-secondary)" }]}
                  curveType="monotone"
                  withGradient
                  textColor={TEXT}
                  gridColor={GRID}
                  yAxisProps={{ allowDecimals: false }}
                />
              </section>
            )}
            <section className={classes.panel}>
              <h4 className={classes.chartTitle}>Ballots</h4>
              <table className={classes.voters}>
                <thead>
                  <tr>
                    <th>Voter</th>
                    <th>Picked</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {poll.voters.map((voter) => (
                    <tr key={voter.username}>
                      <td>{voter.username}</td>
                      <td>
                        {voter.optionIds.map((id) => {
                          const option = optionById.get(id);
                          return option ? (
                            <span key={id} className={classes.pick} style={{ "--option-color": option.color } as CSSProperties}>
                              <span className={classes.legendDot} style={{ background: option.color, width: 8, height: 8 }} />
                              {option.text}
                            </span>
                          ) : null;
                        })}
                      </td>
                      <td className={classes.muted}>{dayjs(voter.votedAt).format("MMM D, HH:mm")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )
      )}
    </div>
  );
}
