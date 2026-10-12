import { showNotification } from "@components/Notification/Notification";
import { useCharacterStore } from "@store/character/characterStore";
import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type { TableToken } from "@appTypes/Tabletop";
import { tabletop } from "@features/tabletop/useTabletopHub";
import { d20With } from "@features/tabletop/useTableRoll";
import { addCondition, concentrationDc, isConcentration, savePassed } from "@utils/concentration";
import { computeEffects } from "@utils/effects";
import { AdjustHpModal } from "./AdjustHpModal";
import { AddConditionModal } from "./AddConditionModal";

/** Damage eats temp HP first; healing stops at max (when max is known). */
function applyHp(token: TableToken, mode: "heal" | "damage", amount: number): Partial<TableToken> {
  if (mode === "heal") return { hp: token.maxHp > 0 ? Math.min(token.maxHp, token.hp + amount) : token.hp + amount };
  const fromTemp = Math.min(token.tempHp, amount);
  return { tempHp: token.tempHp - fromTemp, hp: Math.max(0, token.hp - (amount - fromTemp)) };
}

const withoutConcentration = (token: TableToken) => token.effects.filter((e) => !isConcentration(e.label));

/**
 * Damage on a concentrating token: dropping to 0 HP ends it, anything else rolls the Con save into the log.
 * Character tokens roll their sheet's save and lose concentration on a fail; other tokens get a private d20
 * for the DM to add the Con save to.
 */
async function damage(token: TableToken, amount: number) {
  const patch = applyHp(token, "damage", amount);
  const concentrating = token.effects.some((e) => isConcentration(e.label));
  const downed = token.maxHp > 0 && patch.hp === 0;
  if (concentrating && downed) patch.effects = withoutConcentration(token);
  await tabletop.patchToken(token, patch);
  if (!concentrating || downed) return;

  const dc = concentrationDc(amount);
  const character = useCharacterStore.getState().characters.find((c) => c.id === token.characterId);
  if (!character) {
    await tabletop.roll({ expressions: ["1d20"], label: `Concentration save DC ${dc} (add Con save)`, as: token.name, private: true });
    return;
  }

  const { value, roll: mode } = computeEffects(character).stats["save:con"];
  const twice = mode !== "normal";
  const entry = await tabletop.roll({
    expressions: twice ? [d20With(value), d20With(value)] : [d20With(value)],
    label: `Concentration save DC ${dc}${twice ? ` (${mode})` : ""}`,
    as: character.name,
  });
  if (!entry || savePassed(entry.rolls.map((r) => r.total), dc, mode)) return;

  // The server broadcast the damage before answering, so the store already holds the damaged token.
  const current = useTabletopStore.getState().snapshot?.tokens.find((t) => t.id === token.id);
  if (current) await tabletop.patchToken(current, { effects: withoutConcentration(current) });
  showNotification({ message: `${character.name} lost concentration.`, color: "orange" });
}

/** The DM's heal / damage / condition dialogs, wherever they were opened from (store: tokenDialog). */
export function TokenDialogs() {
  const dialog = useTabletopStore((s) => s.tokenDialog);
  const token = useTabletopStore((s) => s.snapshot?.tokens.find((t) => t.id === s.tokenDialog?.tokenId));
  const close = () => useTabletopStore.getState().set({ tokenDialog: null });
  const hpMode = dialog?.kind === "heal" ? "heal" : "damage";

  return (
    <>
      <AdjustHpModal
        opened={!!token && dialog?.kind !== "condition"}
        mode={hpMode}
        onClose={close}
        onSubmit={(amount) =>
          token && void (hpMode === "damage" ? damage(token, amount) : tabletop.patchToken(token, applyHp(token, hpMode, amount)))
        }
      />
      <AddConditionModal
        opened={!!token && dialog?.kind === "condition"}
        onClose={close}
        existingLabels={token?.effects.map((e) => e.label) ?? []}
        targetName={token?.name}
        onSubmit={(label, remaining) =>
          token && void tabletop.patchToken(token, { effects: addCondition(token.effects, { id: "", label, remaining }, (e) => e.label) })
        }
      />
    </>
  );
}
