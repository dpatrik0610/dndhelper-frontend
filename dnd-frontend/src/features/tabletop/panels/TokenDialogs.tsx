import { useTabletopStore } from "@store/tabletop/tabletopStore";
import type { TableToken } from "@appTypes/Tabletop";
import { tabletop } from "@features/tabletop/useTabletopHub";
import { AdjustHpModal } from "./AdjustHpModal";
import { AddConditionModal } from "./AddConditionModal";

/** Damage eats temp HP first; healing stops at max (when max is known). */
function applyHp(token: TableToken, mode: "heal" | "damage", amount: number): Partial<TableToken> {
  if (mode === "heal") return { hp: token.maxHp > 0 ? Math.min(token.maxHp, token.hp + amount) : token.hp + amount };
  const fromTemp = Math.min(token.tempHp, amount);
  return { tempHp: token.tempHp - fromTemp, hp: Math.max(0, token.hp - (amount - fromTemp)) };
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
        onSubmit={(amount) => token && void tabletop.patchToken(token, applyHp(token, hpMode, amount))}
      />
      <AddConditionModal
        opened={!!token && dialog?.kind === "condition"}
        onClose={close}
        existingLabels={token?.effects.map((e) => e.label) ?? []}
        onSubmit={(label, remaining) => token && void tabletop.patchToken(token, { effects: [...token.effects, { id: "", label, remaining }] })}
      />
    </>
  );
}
