import { memo, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { Text, Title } from "@mantine/core";
import { IconArrowLeft, IconChevronLeft, IconChevronRight, IconLayoutGrid } from "@tabler/icons-react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSpellStore } from "@store/spell/spellStore";
import { useIsMobile } from "@hooks/useIsMobile";
import { loadSpells } from "@utils/loadSpells";
import { SCHOOLS } from "@features/spells/spellMeta";
import classes from "./Schools.module.css";

interface Lore {
  practitioner: string;
  tagline: string;
  description: string;
  hallmarks: string[];
  signature: string[];
}

const LORE: Record<string, Lore> = {
  Abjuration: {
    practitioner: "Abjurer",
    tagline: "Nothing passes the ward.",
    description: "Protective magic that blocks, banishes and unravels. Abjurers raise barriers, seal doors and tear apart the spells of others.",
    hallmarks: ["Wards", "Dispelling", "Banishment"],
    signature: ["Shield", "Counterspell", "Banishment"],
  },
  Conjuration: {
    practitioner: "Conjurer",
    tagline: "What is far away is only a word away.",
    description: "Magic that summons creatures and objects from elsewhere, or folds space to carry the caster across it in a heartbeat.",
    hallmarks: ["Summoning", "Teleportation", "Creation"],
    signature: ["Misty Step", "Cloudkill", "Wish"],
  },
  Divination: {
    practitioner: "Diviner",
    tagline: "Every secret leaves a trace.",
    description: "Magic of knowing. Diviners read hidden truths, see across great distances and catch glimpses of what has not happened yet.",
    hallmarks: ["Insight", "Scrying", "Foresight"],
    signature: ["Detect Magic", "Identify", "Scrying"],
  },
  Enchantment: {
    practitioner: "Enchanter",
    tagline: "The strongest chains are the ones you cannot see.",
    description: "Magic that bends the mind. Enchanters charm, compel and command, turning foes into friends and friends into puppets.",
    hallmarks: ["Charm", "Compulsion", "Command"],
    signature: ["Charm Person", "Hold Person", "Dominate Monster"],
  },
  Evocation: {
    practitioner: "Evoker",
    tagline: "Raw power, shaped and unleashed.",
    description: "Magic that calls up pure energy: fire, lightning, cold and force, as well as the radiant light that knits wounds closed.",
    hallmarks: ["Elements", "Force", "Healing"],
    signature: ["Magic Missile", "Fireball", "Cure Wounds"],
  },
  Illusion: {
    practitioner: "Illusionist",
    tagline: "Seeing is believing. That is the trick.",
    description: "Magic that deceives the senses. Illusionists conjure phantom sights and sounds, hide what is real and show what is not.",
    hallmarks: ["Phantasms", "Disguise", "Invisibility"],
    signature: ["Minor Illusion", "Mirror Image", "Invisibility"],
  },
  Necromancy: {
    practitioner: "Necromancer",
    tagline: "Death is a door. Some of us hold the key.",
    description: "Magic of life and death. Necromancers drain vitality, lay curses, raise the dead, and sometimes pull the dying back.",
    hallmarks: ["Life force", "Undeath", "Curses"],
    signature: ["Chill Touch", "Animate Dead", "Revivify"],
  },
  Transmutation: {
    practitioner: "Transmuter",
    tagline: "Nothing is only what it seems to be.",
    description: "Magic that changes the nature of things. Transmuters reshape matter, quicken bodies and turn one creature into another.",
    hallmarks: ["Transformation", "Enhancement", "Alteration"],
    signature: ["Haste", "Fly", "Polymorph"],
  },
};

const PALETTES: Record<string, { deep: string; light: string; accent: string }> = {
  Abjuration: { deep: "#1e3a8a", light: "#dbeafe", accent: "#67e8f9" },
  Conjuration: { deep: "#064e3b", light: "#d1fae5", accent: "#c084fc" },
  Divination: { deep: "#312e81", light: "#eef2ff", accent: "#fcd34d" },
  Enchantment: { deep: "#831843", light: "#fce7f3", accent: "#a78bfa" },
  Evocation: { deep: "#7f1d1d", light: "#fee2e2", accent: "#fbbf24" },
  Illusion: { deep: "#4c1d95", light: "#fae8ff", accent: "#5eead4" },
  Necromancy: { deep: "#0f172a", light: "#f1f5f9", accent: "#86efac" },
  Transmutation: { deep: "#7c2d12", light: "#ffedd5", accent: "#fde047" },
};

const paletteVars = (name: string) =>
  ({
    "--school": SCHOOLS[name].color,
    "--deep": PALETTES[name].deep,
    "--light": PALETTES[name].light,
    "--accent": PALETTES[name].accent,
  }) as CSSProperties;

const NEUTRAL_AURA = { "--aura-a": "#7c5cd6", "--aura-b": "#2b9bb0", "--aura-c": "#b4546f" } as CSSProperties;
const auraVars = (name: string) =>
  ({ "--aura-a": SCHOOLS[name].color, "--aura-b": PALETTES[name].accent, "--aura-c": PALETTES[name].deep }) as CSSProperties;

const NAMES = Object.keys(SCHOOLS);
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const wrap = (i: number) => (i + NAMES.length) % NAMES.length;
const STEP = 300;
const SHIFTS = [0, 74, 116, 150, 176];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function place(f: number) {
  const a = Math.min(Math.abs(f), SHIFTS.length - 1);
  const lo = Math.floor(a);
  const hi = Math.min(lo + 1, SHIFTS.length - 1);
  const shift = SHIFTS[lo] + (SHIFTS[hi] - SHIFTS[lo]) * (a - lo);
  return {
    "--shift": `${Math.sign(f) * shift}%`,
    "--scale": 1 - 0.15 * Math.min(a, 3),
    "--rot": `${-22 * clamp(f, -2.5, 2.5)}deg`,
    "--shade": 0.3 * Math.min(a, 3),
    opacity: clamp(1.5 - a * 0.5, 0, 1),
    zIndex: 100 - Math.round(a * 10),
  } as CSSProperties;
}

const PARTICLES = Array.from({ length: 8 }, (_, k) => ({ "--k": k, "--x": `${(k * 37 + 11) % 100}%`, "--y": `${(k * 61 + 23) % 100}%` }) as CSSProperties);

export default function SchoolsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const spellNames = useSpellStore((s) => s.spellNames);
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ x: number; dx: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (useSpellStore.getState().spellNames.length === 0) void loadSpells();
  }, []);

  const step = (delta: number) => setActive((i) => (i === null ? i : wrap(i + delta)));
  const open = active !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]")) return;
      if (e.key === "ArrowLeft") setActive((i) => (i === null ? i : wrap(i - 1)));
      else if (e.key === "ArrowRight") setActive((i) => (i === null ? i : wrap(i + 1)));
      else if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const counts = useMemo(() => {
    const bySchool: Record<string, number> = {};
    for (const s of spellNames) if (s.school?.name) bySchool[s.school.name] = (bySchool[s.school.name] ?? 0) + 1;
    return bySchool;
  }, [spellNames]);
  const countFor = (school: string) => counts[school] ?? 0;
  const findSpell = (name: string) => spellNames.find((s) => s.name.toLowerCase() === name.toLowerCase())?.name;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, dx: 0, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 8) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    d.dx = clamp(dx, -2.5 * STEP, 2.5 * STEP);
    setDragX(d.dx);
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    const steps = Math.round(d.dx / STEP) || (Math.abs(d.dx) > 60 ? Math.sign(d.dx) : 0);
    if (steps) setActive((i) => (i === null ? i : wrap(i - steps)));
    setDragX(0);
  };

  const focus = open ? active : hovered;

  return (
    <div className={classes.page} style={{ padding: isMobile ? "var(--mantine-spacing-sm)" : undefined }}>
      {createPortal(
        <div className={classes.auraRoot} aria-hidden>
          <div className={classes.aura} style={NEUTRAL_AURA} data-on={focus === null || undefined} />
          {NAMES.map((name, i) => (
            <div key={name} className={classes.aura} style={auraVars(name)} data-on={focus === i || undefined} />
          ))}
        </div>,
        document.body
      )}
      <header className={classes.header}>
        <button type="button" className={`glass-btn-secondary ${classes.navBtn}`} onClick={() => navigate("/spells")}>
          <IconArrowLeft size={16} /> Spellbook
        </button>
        <div className={classes.heading}>
          <Title order={1} className="narrative-title" fz={isMobile ? 24 : 32} c="var(--theme-color-text-primary)">
            Schools of Magic
          </Title>
          <Text size="sm" c="var(--theme-color-text-secondary)">
            Eight traditions. Every spell ever cast belongs to one of them.
          </Text>
        </div>
        {open ? (
          <button type="button" className={`glass-btn-secondary ${classes.navBtn}`} onClick={() => setActive(null)}>
            <IconLayoutGrid size={16} /> All schools
          </button>
        ) : (
          <span className={classes.headerSpacer} aria-hidden />
        )}
      </header>

      <div className={classes.body}>
        {!open ? (
          <div className={classes.grid}>
            {NAMES.map((name, i) => (
              <button
                key={name}
                type="button"
                className={`${classes.card} ${classes.gridCard}`}
                style={{ ...paletteVars(name), "--i": i } as CSSProperties}
                onClick={() => {
                  setActive(i);
                  setHovered(null);
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                aria-label={`${name}: ${LORE[name].tagline}`}
              >
                <CardFace index={i} name={name} lore={LORE[name]} count={countFor(name)} />
              </button>
            ))}
          </div>
        ) : (
          <section className={classes.carousel} aria-roledescription="carousel" aria-label="Schools of magic">
            <div
              className={classes.viewport}
              data-dragging={dragX !== 0 || undefined}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <div className={classes.stage}>
                {NAMES.map((name, i) => {
                  const n = NAMES.length;
                  const offset = ((i - active + n + n / 2) % n) - n / 2;
                  const isActive = offset === 0;
                  const f = offset + dragX / STEP;
                  const hidden = Math.abs(f) > 2.6;
                  return (
                    <div
                      key={name}
                      className={`${classes.card} ${classes.slide}`}
                      data-active={isActive || undefined}
                      data-hidden={hidden || undefined}
                      data-far={Math.abs(f) > 1.5 || undefined}
                      style={{ ...paletteVars(name), ...place(f) } as CSSProperties}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={name}
                      aria-hidden={hidden || undefined}
                    >
                      <CardFace index={i} name={name} lore={LORE[name]} count={countFor(name)} />
                      {isActive && <span className={classes.burst} aria-hidden />}
                      <div className={classes.details} inert={!isActive}>
                        <p className={classes.description}>{LORE[name].description}</p>
                        <div className={classes.hallmarks}>
                          {LORE[name].hallmarks.map((h) => (
                            <span key={h} className={classes.hallmark}>{h}</span>
                          ))}
                        </div>
                        <div className={classes.sectionLabel}>Signature spells</div>
                        <div className={classes.signature}>
                          {LORE[name].signature.map((spell) => {
                            const found = findSpell(spell);
                            return found ? (
                              <button key={spell} type="button" className={classes.spellLink} onClick={() => navigate(`/spells/${encodeURIComponent(found)}`)}>
                                {spell}
                              </button>
                            ) : (
                              <span key={spell} className={classes.spellLink} data-missing>{spell}</span>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          className={classes.browse}
                          onClick={() => navigate(`/spells?school=${encodeURIComponent(name)}`)}
                        >
                          Browse {countFor(name)} {name.toLowerCase()} spells
                        </button>
                      </div>
                      {!isActive && !hidden && (
                        <button type="button" className={classes.slideHit} onClick={() => setActive(i)} aria-label={`Show ${name}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <nav className={classes.controls} aria-label="Choose a school">
              <button type="button" className={classes.arrow} onClick={() => step(-1)} aria-label="Previous school">
                <IconChevronLeft size={20} />
              </button>
              <div className={classes.dots}>
                {NAMES.map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    className={classes.dot}
                    style={paletteVars(name)}
                    data-active={i === active || undefined}
                    aria-current={i === active || undefined}
                    aria-label={name}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
              <button type="button" className={classes.arrow} onClick={() => step(1)} aria-label="Next school">
                <IconChevronRight size={20} />
              </button>
            </nav>
          </section>
        )}
      </div>
    </div>
  );
}

const CardFace = memo(function CardFace({ index, name, lore, count }: { index: number; name: string; lore: Lore; count: number }) {
  return (
    <>
      <span className={classes.frame} aria-hidden />
      <Emblem school={name} className={classes.watermark} />
      <div className={classes.numeral} aria-hidden>{ROMAN[index]}</div>
      <div className={classes.sigil} aria-hidden>
        <Magic school={name} />
        <svg className={classes.runeCircle} viewBox="-50 -50 100 100">
          <circle r="48" />
          <circle r="41" />
          {Array.from({ length: 24 }, (_, k) => (
            <line key={k} y1={-48} y2={k % 3 === 0 ? -42.5 : -45.5} transform={`rotate(${k * 15})`} />
          ))}
          {[0, 90, 180, 270].map((a) => (
            <rect key={a} x={-2.4} y={-50.4} width={4.8} height={4.8} transform={`rotate(${a}) rotate(45 0 -48)`} />
          ))}
        </svg>
        <Emblem school={name} className={classes.emblem} gradient />
      </div>
      <div className={classes.name}>{name}</div>
      <div className={classes.practitioner}>The {lore.practitioner}</div>
      <div className={classes.divider} aria-hidden />
      <p className={classes.tagline}>“{lore.tagline}”</p>
      <div className={classes.count}>{count} {count === 1 ? "spell" : "spells"}</div>
    </>
  );
});

function Magic({ school }: { school: string }) {
  const particles = (className: string, count = PARTICLES.length) =>
    PARTICLES.slice(0, count).map((style, k) => <span key={k} className={className} style={style} />);

  switch (school) {
    case "Abjuration":
      return (
        <div className={classes.magic}>
          {particles(classes.ward, 3)}
          <svg className={classes.hexWard} viewBox="-50 -50 100 100">
            <polygon points="0,-46 40,-23 40,23 0,46 -40,23 -40,-23" />
            <polygon points="0,-34 29,-17 29,17 0,34 -29,17 -29,-17" />
          </svg>
        </div>
      );
    case "Conjuration":
      return (
        <div className={classes.magic}>
          <span className={classes.portal} />
          {particles(classes.motes)}
        </div>
      );
    case "Divination":
      return (
        <div className={classes.magic}>
          <span className={classes.sweep} />
          {particles(classes.star)}
        </div>
      );
    case "Enchantment":
      return (
        <div className={classes.magic}>
          {particles(classes.hypno, 4)}
          {particles(classes.heart, 6)}
        </div>
      );
    case "Evocation":
      return (
        <div className={classes.magic}>
          <span className={classes.flame} />
          {particles(classes.ember)}
        </div>
      );
    case "Illusion":
      return (
        <div className={classes.magic}>
          {[0, 1, 2].map((k) => (
            <Emblem key={k} school={school} className={classes.mirror} style={{ "--k": k } as CSSProperties} />
          ))}
          {particles(classes.shimmer, 6)}
        </div>
      );
    case "Necromancy":
      return (
        <div className={classes.magic}>
          {particles(classes.wisp, 6)}
          {particles(classes.soul, 3)}
        </div>
      );
    case "Transmutation":
      return (
        <div className={classes.magic}>
          <span className={classes.blob} />
          <svg className={classes.alchemy} viewBox="-50 -50 100 100">
            <circle r="44" />
            <polygon points="0,-44 38,22 -38,22" />
            <rect x="-22" y="-22" width="44" height="44" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}

const EMBLEMS: Record<string, ReactNode> = {
  Abjuration: (
    <>
      <path pathLength={1} d="M0 -19 L15 -13 V-1 C15 9 8 15 0 19 C-8 15 -15 9 -15 -1 V-13 Z" />
      <path pathLength={1} className={classes.faint} d="M0 -14 L11 -9.5 V-1 C11 6.5 6 11 0 14 C-6 11 -11 6.5 -11 -1 V-9.5 Z" />
      <path pathLength={1} d="M0 10 V-10 M0 -1 L-6.5 -8 M0 -1 L6.5 -8" />
    </>
  ),
  Conjuration: (
    <>
      <path pathLength={1} d="M-12 18 V-5 A12 12 0 0 1 12 -5 V18" />
      <path pathLength={1} d="M-17 18 H17" />
      <path pathLength={1} className={classes.faint} d="M-7 18 V-4 A7 7 0 0 1 7 -4 V18" />
      <path pathLength={1} d="M0 -3 Q1 3 7 4 Q1 5 0 11 Q-1 5 -7 4 Q-1 3 0 -3 Z" />
    </>
  ),
  Divination: (
    <>
      <path pathLength={1} d="M0 -19 L19 14 H-19 Z" />
      <path pathLength={1} d="M-11 4 Q0 -7 11 4 Q0 15 -11 4 Z" />
      <circle pathLength={1} cy={4} r={3.2} />
      <path pathLength={1} className={classes.faint} d="M0 -24 V-21.5 M-9 -21 L-7.5 -18.5 M9 -21 L7.5 -18.5" />
    </>
  ),
  Enchantment: (
    <>
      <path pathLength={1} d="M-15 -14 H15 M0 -21 V-8" />
      <path pathLength={1} className={classes.faint} d="M-12 -14 L-6 2 M12 -14 L6 2 M0 -8 V5" />
      <path pathLength={1} d="M0 19 C-13 11 -11 1 -5.5 1 C-2.5 1 0 3.5 0 6 C0 3.5 2.5 1 5.5 1 C11 1 13 11 0 19 Z" />
    </>
  ),
  Evocation: (
    <>
      <path pathLength={1} d="M0 -21 C5 -13 13 -7 13 4 C13 13 7 19 0 19 C-7 19 -13 13 -13 4 C-13 -3 -9 -7 -6 -12 C-5 -6 -3 -4 -1 -4 C-3 -10 -3 -16 0 -21 Z" />
      <path pathLength={1} className={classes.faint} d="M0 2 C3 6 6.5 8.5 6.5 12.5 C6.5 16 3.5 18 0 18 C-3.5 18 -6.5 16 -6.5 12.5 C-6.5 9 -3.5 7.5 -2 4.5 C-1 6.5 0 6 0 2 Z" />
    </>
  ),
  Illusion: (
    <>
      <path pathLength={1} className={classes.faint} d="M-14 -13 C-7 -17 13 -17 20 -13 C20 -1 15 9 3 11" />
      <path pathLength={1} d="M-17 -9 C-10 -13 10 -13 17 -9 C17 3 12 13 0 15 C-12 13 -17 3 -17 -9 Z" />
      <path pathLength={1} d="M-11.5 -3 Q-7 -7.5 -2.5 -3 Q-7 -0.5 -11.5 -3 Z M11.5 -3 Q7 -7.5 2.5 -3 Q7 -0.5 11.5 -3 Z" />
      <path pathLength={1} d="M-4 7 Q0 9 4 7" />
    </>
  ),
  Necromancy: (
    <>
      <path pathLength={1} d="M-9 13 V8 C-12 6 -14 3 -14 -2 C-14 -12 -7 -18 0 -18 C7 -18 14 -12 14 -2 C14 3 12 6 9 8 V13 Z" />
      <circle pathLength={1} cx={-5.5} cy={-2} r={3.6} />
      <circle pathLength={1} cx={5.5} cy={-2} r={3.6} />
      <path pathLength={1} d="M0 3 L-2 7 H2 Z" />
      <path pathLength={1} className={classes.faint} d="M-4.5 9.5 V13 M0 9.5 V13 M4.5 9.5 V13 M-9 18 H9" />
    </>
  ),
  Transmutation: (
    <>
      <path pathLength={1} d="M-7.5 -19 A7.5 7.5 0 0 0 7.5 -19" />
      <circle pathLength={1} cy={-4} r={7.5} />
      <path pathLength={1} d="M0 3.5 V19 M-6.5 11.5 H6.5" />
      <path pathLength={1} className={classes.faint} d="M0 -22 L19 11 H-19 Z" />
    </>
  ),
};

function Emblem({ school, className, style, gradient }: { school: string; className?: string; style?: CSSProperties; gradient?: boolean }) {
  const id = `emblem-${useId().replace(/[^\w-]/g, "")}`;
  return (
    <svg
      className={`${classes.emblemSvg} ${className ?? ""}`}
      style={gradient ? { ...style, stroke: `url(#${id})` } : style}
      viewBox="-24 -24 48 48"
      aria-hidden
    >
      {gradient && (
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={-20} y1={-22} x2={20} y2={22}>
            <stop offset="0" style={{ stopColor: "var(--light)" }} />
            <stop offset="0.5" style={{ stopColor: "var(--school)" }} />
            <stop offset="1" style={{ stopColor: "var(--accent)" }} />
          </linearGradient>
        </defs>
      )}
      {EMBLEMS[school]}
    </svg>
  );
}
