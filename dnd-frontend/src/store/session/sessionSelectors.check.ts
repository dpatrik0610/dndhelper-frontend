// Self-check: npx esbuild src/store/session/sessionSelectors.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import type { Session, SessionStatus } from "@appTypes/Session";
import { featuredSession, groupSessions, nextPlanned } from "./sessionSelectors";

const s = (number: number, status: SessionStatus) => ({ id: `s${number}`, number, status }) as Session;

const all = [s(3, "Planned"), s(1, "Completed"), s(2, "Completed"), s(4, "Planned")];
const groups = groupSessions(all);
assert.deepEqual(groups.played.map((x) => x.number), [2, 1], "played runs newest first");
assert.deepEqual(groups.upcoming.map((x) => x.number), [3, 4], "upcoming runs soonest first");

assert.equal(featuredSession(all)?.number, 2, "no live session: the last one played");
assert.equal(featuredSession([...all, s(5, "Live")])?.number, 5, "a live session always wins");
assert.equal(featuredSession([s(7, "Planned")])?.number, 7, "nothing played yet: the next planned");
assert.equal(featuredSession([]), null);

assert.equal(nextPlanned(all, s(2, "Live"))?.number, 3, "next is the lowest planned number above the current");
assert.equal(nextPlanned(all, s(9, "Live"))?.number, 3, "no planned session after it: the earliest planned");
assert.equal(nextPlanned(all, all[0])?.number, 4, "never the current session itself");
assert.equal(nextPlanned([s(1, "Completed")]), null);

console.log("session selector checks passed");
