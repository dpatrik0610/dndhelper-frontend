import { useEffect, useState } from "react";
import { Button, Loader, Modal, NumberInput } from "@mantine/core";
import {
  IconArrowBigDownLines,
  IconBan,
  IconBolt,
  IconBrain,
  IconCheck,
  IconEarOff,
  IconEyeClosed,
  IconEyeOff,
  IconFlask,
  IconGhost,
  IconHandGrab,
  IconHeart,
  IconInfinity,
  IconLink,
  IconMountain,
  IconSearch,
  IconSparkles,
  IconStars,
  IconZzz,
  type Icon,
} from "@tabler/icons-react";
import { getCondition, getConditions } from "@services/conditionService";

interface AddConditionModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (label: string, remaining: number | null) => void;
  existingLabels?: string[];
  /** Whose condition it is, for the header ("Goblin"). */
  targetName?: string;
}

const ICONS: Record<string, Icon> = {
  concentrating: IconBrain,
  blinded: IconEyeOff,
  charmed: IconHeart,
  deafened: IconEarOff,
  exhaustion: IconZzz,
  frightened: IconGhost,
  grappled: IconHandGrab,
  incapacitated: IconBan,
  invisible: IconEyeClosed,
  paralyzed: IconBolt,
  petrified: IconMountain,
  poisoned: IconFlask,
  prone: IconArrowBigDownLines,
  restrained: IconLink,
  stunned: IconStars,
  unconscious: IconZzz,
};
const iconFor = (name: string) => ICONS[name.trim().toLowerCase()] ?? IconSparkles;

/** Rounds; null = until removed. */
const DURATIONS: { value: number | null; label: string }[] = [
  { value: null, label: "Until removed" },
  { value: 1, label: "1 round" },
  { value: 3, label: "3 rounds" },
  { value: 10, label: "1 minute" },
];

// The list and the rules text come from dnd5eapi; fetch each once per session.
let conditionList: Promise<string[]> | null = null;
const rulesCache = new Map<string, Promise<string[]>>();
const rulesFor = (name: string) => {
  if (!rulesCache.has(name)) rulesCache.set(name, getCondition(name));
  return rulesCache.get(name)!;
};

export function AddConditionModal({ opened, onClose, onSubmit, existingLabels = [], targetName }: AddConditionModalProps) {
  const [conditions, setConditions] = useState<string[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [rules, setRules] = useState<string[] | null>(null);

  useEffect(() => {
    if (!opened) return;
    setQuery("");
    setSelected(null);
    setDuration(null);
    let current = true;
    conditionList ??= getConditions();
    void conditionList.then((list) => current && setConditions(list));
    return () => {
      current = false;
    };
  }, [opened]);

  useEffect(() => {
    if (!selected) return setRules(null);
    let current = true;
    setRules(null);
    void rulesFor(selected).then((lines) => current && setRules(lines));
    return () => {
      current = false;
    };
  }, [selected]);

  const active = new Set(existingLabels.map((c) => c.trim().toLowerCase()).filter(Boolean));
  const q = query.trim();
  const shown = (conditions ?? []).filter((c) => c.toLowerCase().includes(q.toLowerCase()));
  // Typing a name that isn't in the list makes it a custom condition.
  const custom = q && !(conditions ?? []).some((c) => c.toLowerCase() === q.toLowerCase()) ? q : null;
  const label = (selected ?? custom ?? "").trim();
  const duplicate = !!label && active.has(label.toLowerCase());

  const apply = () => {
    if (!label || duplicate) return;
    onSubmit(label, duration);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size={560}
      radius="lg"
      classNames={{ content: "tt-cond", header: "tt-cond-header", body: "tt-cond-body" }}
      title={
        <div className="tt-cond-title">
          <span className="tt-cond-title-icon">
            <IconSparkles size={18} />
          </span>
          <div>
            <strong>Add condition</strong>
            {targetName && <span>to {targetName}</span>}
          </div>
        </div>
      }
    >
      <label className="tt-cond-search">
        <IconSearch size={16} />
        <input
          autoFocus
          placeholder="Search, or type a custom condition…"
          value={query}
          onChange={(e) => {
            setQuery(e.currentTarget.value);
            setSelected(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          aria-label="Search conditions"
        />
      </label>

      <div className="tt-cond-grid" role="listbox" aria-label="Conditions">
        {conditions === null ? (
          <div className="tt-cond-empty">
            <Loader size="sm" />
          </div>
        ) : (
          shown.map((name) => {
            const CondIcon = iconFor(name);
            const on = active.has(name.toLowerCase());
            return (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={selected === name}
                disabled={on}
                className={`tt-cond-card${selected === name ? " selected" : ""}${on ? " active" : ""}`}
                onClick={() => setSelected(selected === name ? null : name)}
              >
                <span className="tt-cond-icon">
                  <CondIcon size={16} />
                </span>
                <span className="tt-cond-name">{name}</span>
                {on && <span className="tt-cond-tag">On</span>}
              </button>
            );
          })
        )}
        {custom && (
          <button type="button" className={`tt-cond-card custom${duplicate ? " active" : ""}`} disabled={duplicate} onClick={apply}>
            <span className="tt-cond-icon">
              <IconSparkles size={16} />
            </span>
            <span className="tt-cond-name">Custom: “{custom}”</span>
          </button>
        )}
        {conditions !== null && !shown.length && !custom && <div className="tt-cond-empty">No conditions match.</div>}
      </div>

      {selected && (
        <div className="tt-cond-rules">
          <span className="tt-cond-section">{selected}</span>
          {rules === null ? (
            <Loader size="xs" />
          ) : rules.length ? (
            <ul>
              {rules.map((line, i) => (
                <li key={i}>{line.replace(/^[-•]\s*/, "")}</li>
              ))}
            </ul>
          ) : (
            <p>No rules text for this one.</p>
          )}
        </div>
      )}

      <div className="tt-cond-duration">
        <span className="tt-cond-section">Duration</span>
        <div className="tt-cond-pills">
          {DURATIONS.map((d) => (
            <button
              key={d.label}
              type="button"
              className={`tt-cond-pill${duration === d.value ? " on" : ""}`}
              onClick={() => setDuration(d.value)}
            >
              {d.value === null && <IconInfinity size={14} />}
              {d.label}
            </button>
          ))}
          <NumberInput
            size="xs"
            radius="xl"
            w={110}
            min={1}
            max={99}
            placeholder="Rounds"
            value={duration !== null && !DURATIONS.some((d) => d.value === duration) ? duration : ""}
            onChange={(v) => setDuration(typeof v === "number" && v > 0 ? v : null)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            aria-label="Custom duration in rounds"
          />
        </div>
      </div>

      <div className="tt-cond-footer">
        <Button variant="subtle" color="gray" radius="xl" onClick={onClose}>
          Cancel
        </Button>
        <Button radius="xl" leftSection={<IconCheck size={16} />} onClick={apply} disabled={!label || duplicate}>
          {duplicate ? "Already on" : label ? `Apply ${label}` : "Pick a condition"}
        </Button>
      </div>
    </Modal>
  );
}
