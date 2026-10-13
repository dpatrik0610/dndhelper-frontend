import { useCharacterFormStore } from "@store/character/characterFormStore";
import { ResourceRow } from "@features/characterForm/components/ResourceRow";
import { List } from "@features/characterForm/components/FormList";
import { clampCounter } from "@features/characterForm/components/clampCounter";
import type { SpellSlot } from "@appTypes/Character/SpellSlot";
import s from "@styles/CharacterForm.module.css";

export function SpellSlotsSection() {
  const { characterForm, setCharacterForm } = useCharacterFormStore();
  const slots = characterForm.spellSlots ?? [];

  const update = (level: number, patch: Partial<SpellSlot>) =>
    setCharacterForm({
      spellSlots: slots.map((slot) => (slot.level === level ? clampCounter({ ...slot, ...patch }) : slot)),
    });

  return (
    <>
      <div className={s.hint}>Remaining / maximum slots per spell level.</div>
      <List cols={2}>
        {slots.map((slot) => (
          <ResourceRow
            key={slot.level}
            label={`Level ${slot.level}`}
            current={slot.current}
            max={slot.max}
            onCurrentChange={(v) => update(slot.level, { current: v })}
            onMaxChange={(v) => update(slot.level, { max: v })}
          />
        ))}
      </List>
    </>
  );
}
