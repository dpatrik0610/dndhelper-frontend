// Self-check: npx esbuild src/components/search/commands.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json '--define:import.meta.env={}' | node
import assert from "node:assert/strict";
import { defaultCharacter } from "@appTypes/Character/DefaultCharacter";
import { parseAmount, parseCommand, suggestCommands } from "./commands";

assert.deepEqual(parseCommand("/heal 8 bram"), { name: "heal", args: "8 bram" });
assert.deepEqual(parseCommand("  /HEAL"), { name: "heal", args: null }, "no args until a space");
assert.deepEqual(parseCommand("/heal "), { name: "heal", args: "" });
assert.equal(parseCommand("heal"), null);
assert.deepEqual(parseAmount("8 bram"), { amount: 8, rest: "bram" });
assert.equal(parseAmount("bram"), null);
assert.equal(parseAmount("0"), null);

const bram = { ...defaultCharacter, id: "b", name: "Bram" };
const lia = { ...defaultCharacter, id: "l", name: "Lia" };
const ctx = { roster: [bram, lia], mine: [bram], navigate: () => {} };
const titles = (input: string, dm = true) => suggestCommands(input, ctx, dm).map((s) => s.title);

assert.deepEqual(titles("/"), ["/roll <dice>", "/profile [name]", "/join <code>", "/longrest", "/inspire <name>", "/heal <amount> [name]", "/damage <amount> [name]"]);
assert.deepEqual(titles("/", false), ["/roll <dice>", "/profile [name]", "/join <code>"], "players only get their commands");
assert.equal(suggestCommands("/he", ctx, true)[0].complete, "/heal ", "picking a name fills it in");
assert.deepEqual(titles("/heal 5"), ["Heal everyone 5", "Heal Bram 5", "Heal Lia 5"]);
assert.deepEqual(titles("/damage 3 li"), ["Damage Lia 3"]);
assert.equal(suggestCommands("/heal x", ctx, true)[0].run, undefined, "no amount is a hint");
assert.deepEqual(titles("/inspire br"), ["Inspire Bram"]);
assert.deepEqual(titles("/profile"), ["/profile [name]"]);
assert.deepEqual(titles("/profile "), ["Bram"]);
assert.ok(suggestCommands("/longrest", ctx, true)[0].confirm, "long rest asks twice");
assert.deepEqual(titles("/join ab12cd"), ["Join table AB12CD"]);
assert.equal(suggestCommands("/join ab1", ctx, true)[0].run, undefined, "a short code is a hint");
assert.deepEqual(titles("/nope"), []);

console.log("command checks passed");
