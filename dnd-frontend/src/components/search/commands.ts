import type { NavigateFunction } from "react-router-dom";
import { showNotification } from "@components/Notification/Notification";
import { bulkLongRest, getCharacterById, updateCharacter } from "@services/characterService";
import { rollByExpression } from "@services/rollService";
import { useCharacterStore } from "@store/character/characterStore";
import { TABLE_CODE_LENGTH } from "@store/tabletop/tabletopStore";
import type { Character } from "@appTypes/Character/Character";
import { classSummary } from "@utils/hitDice";
import { applyHp } from "@utils/hp";
import { formatRollExpression, formatRollsList } from "@utils/rollFormat";

export interface Suggestion {
  key: string;
  title: string;
  meta: string;
  imageUrl?: string | null;
  complete?: string;
  confirm?: boolean;
  run?: () => Promise<void>;
}

export interface CommandContext {
  roster: Character[];
  mine: Character[];
  navigate: NavigateFunction;
  openNotes: () => void;
}

interface Command {
  name: string;
  usage: string;
  meta: string;
  dmOnly: boolean;
  suggest: (args: string, ctx: CommandContext) => Suggestion[];
}

const LIMIT = 8;

export function parseCommand(input: string): { name: string; args: string | null } | null {
  const m = /^\/(\S*)(?:\s+([\s\S]*))?$/.exec(input.trimStart());
  return m ? { name: m[1].toLowerCase(), args: m[2] === undefined ? null : m[2].trim() } : null;
}

export function parseAmount(args: string): { amount: number; rest: string } | null {
  const m = /^(\d+)\s*(.*)$/.exec(args);
  return m && +m[1] > 0 ? { amount: +m[1], rest: m[2].trim() } : null;
}

const named = (list: Character[], q: string) =>
  list.filter((c) => (c.name ?? "").toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)).slice(0, LIMIT);

const bare = (c: Command) => c.usage === `/${c.name}`;

const hint = (key: string, title: string, meta: string): Suggestion => ({ key, title, meta });

async function patchCharacter(id: string, change: (c: Character) => Partial<Character>) {
  const fresh = await getCharacterById(id);
  if (!fresh) throw new Error("Couldn't load the character.");
  const updated = await updateCharacter({ ...fresh, ...change(fresh) });
  if (!updated) throw new Error(`Couldn't save ${fresh.name}.`);
  const store = useCharacterStore.getState();
  if (store.character?.id === id) store.setCharacter(updated);
}

function changeHp(targets: Character[], amount: number) {
  return async () => {
    const lines: string[] = [];
    const saves: string[] = [];
    const failed: string[] = [];
    await Promise.all(
      targets.map((t) =>
        patchCharacter(t.id!, (c) => {
          const { patch, message, concentration } = applyHp(c, amount);
          lines.push(targets.length > 1 ? `${c.name}: ${message}` : message);
          if (concentration) saves.push(`${c.name}: ${concentration}`);
          return patch;
        }).catch(() => failed.push(t.name)),
      ),
    );
    if (lines.length) showNotification({ title: amount > 0 ? "Healed" : "Damage applied", message: lines.join(" · "), color: amount > 0 ? "green" : "red" });
    if (saves.length) showNotification({ title: "Concentration check", message: saves.join(" · "), color: "yellow" });
    if (failed.length) showNotification({ title: "Not applied", message: `Couldn't update ${failed.join(", ")}.`, color: "orange" });
  };
}

const hpCommand = (name: "heal" | "damage", verb: string, sign: 1 | -1): Command => ({
  name,
  usage: `/${name} <amount> [name]`,
  meta: `${verb} a character, or everyone`,
  dmOnly: true,
  suggest: (args, { roster }) => {
    const parsed = parseAmount(args);
    if (!parsed) return [hint(`${name}-hint`, `/${name} <amount> [name]`, `Type an amount, e.g. /${name} 8 Bram`)];
    const { amount, rest } = parsed;
    const targets = named(roster, rest);
    return [
      ...(!rest && roster.length > 1
        ? [{ key: `${name}-all`, title: `${verb} everyone ${amount}`, meta: roster.map((c) => c.name).join(", "), run: changeHp(roster, sign * amount) }]
        : []),
      ...targets.map((c) => ({
        key: `${name}-${c.id}`,
        title: `${verb} ${c.name} ${amount}`,
        meta: `HP ${c.hitPoints ?? 0}${c.temporaryHitPoints ? ` +${c.temporaryHitPoints} temp` : ""}`,
        imageUrl: c.imageUrl,
        run: changeHp([c], sign * amount),
      })),
    ];
  },
});

const COMMANDS: Command[] = [
  {
    name: "roll",
    usage: "/roll <dice>",
    meta: "Roll dice, e.g. 2d6+3",
    dmOnly: false,
    suggest: (args) =>
      args
        ? [
            {
              key: "roll",
              title: `Roll ${args}`,
              meta: "Rolled on the server",
              run: async () => {
                const r = await rollByExpression(args);
                showNotification({ title: `${formatRollExpression(r)} = ${r.total}`, message: `Rolls: ${formatRollsList(r)}`, color: "violet" });
              },
            },
          ]
        : [hint("roll-hint", "/roll <dice>", "Type dice, e.g. /roll 2d20+5")],
  },
  {
    name: "profile",
    usage: "/profile [name]",
    meta: "Open a character's sheet",
    dmOnly: false,
    suggest: (args, { mine, navigate }) =>
      named(mine, args).map((c) => ({
        key: `profile-${c.id}`,
        title: c.name,
        meta: [`Level ${c.level}`, c.race, classSummary(c)].filter(Boolean).join(" · "),
        imageUrl: c.imageUrl,
        run: async () => {
          useCharacterStore.getState().setCharacter(c);
          navigate("/profile");
        },
      })),
  },
  {
    name: "notes",
    usage: "/notes",
    meta: "Open your character's notes",
    dmOnly: false,
    suggest: (_, { openNotes }) => {
      const character = useCharacterStore.getState().character;
      if (!character) return [hint("notes-hint", "/notes", "Select a character first")];
      return [{ key: "notes", title: `${character.name}'s notes`, meta: "Search, open or add a note", run: async () => openNotes() }];
    },
  },
  {
    name: "join",
    usage: "/join <code>",
    meta: "Join a tabletop session by its room code",
    dmOnly: false,
    suggest: (args, { navigate }) => {
      const code = args.toUpperCase();
      if (!new RegExp(`^[A-Z0-9]{${TABLE_CODE_LENGTH}}$`).test(code))
        return [hint("join-hint", "/join <code>", `Type the ${TABLE_CODE_LENGTH}-character room code from your DM`)];
      return [{ key: "join", title: `Join table ${code}`, meta: "Opens the tabletop", run: async () => navigate(`/table/${code}`) }];
    },
  },
  {
    name: "longrest",
    usage: "/longrest",
    meta: "Every character in the campaign: full HP and spell slots, half their hit dice back",
    dmOnly: true,
    suggest: (_, { roster }) => [
      {
        key: "longrest",
        title: "Long rest for everyone",
        meta: roster.length ? roster.map((c) => c.name).join(", ") : "No characters in this campaign",
        confirm: true,
        run: roster.length
          ? async () => {
              const { successful, failed } = await bulkLongRest(roster.map((c) => c.id!));
              if (successful.length) showNotification({ title: "Long rest", message: `${successful.length} character(s) rested.`, color: "green" });
              if (failed.length) showNotification({ title: "Long rest incomplete", message: `${failed.length} character(s) couldn't rest.`, color: "orange" });
            }
          : undefined,
      },
    ],
  },
  {
    name: "inspire",
    usage: "/inspire <name>",
    meta: "Give a character inspiration",
    dmOnly: true,
    suggest: (args, { roster }) =>
      named(roster, args).map((c) => ({
        key: `inspire-${c.id}`,
        title: `Inspire ${c.name}`,
        meta: `Inspiration ${c.inspiration ?? 0} → ${(c.inspiration ?? 0) + 1}`,
        imageUrl: c.imageUrl,
        run: async () => {
          await patchCharacter(c.id!, (fresh) => ({ inspiration: (fresh.inspiration ?? 0) + 1 }));
          showNotification({ title: "Inspired", message: `${c.name} gained inspiration.`, color: "violet" });
        },
      })),
  },
  hpCommand("heal", "Heal", 1),
  hpCommand("damage", "Damage", -1),
];

export function suggestCommands(input: string, ctx: CommandContext, dm: boolean): Suggestion[] {
  const parsed = parseCommand(input);
  if (!parsed) return [];
  const available = COMMANDS.filter((c) => dm || !c.dmOnly);
  const exact = available.find((c) => c.name === parsed.name);
  if (exact && (parsed.args !== null || bare(exact))) return exact.suggest(parsed.args ?? "", ctx);
  return available
    .filter((c) => c.name.startsWith(parsed.name))
    .map((c) => ({ key: `cmd-${c.name}`, title: c.usage, meta: c.meta, complete: bare(c) ? c.usage : `/${c.name} ` }));
}
