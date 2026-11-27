const DIR = "/assets/sounds/mine/";

export const SFX = {
  dig: "dig.wav",
  crit: "crit.wav",
  break: "break.wav",
  ore: "ore.wav",
  discover: "discover.wav",
  full: "full.wav",
  chest: "chest.wav",
  jackpot: "jackpot.wav",
  geode: "geode.wav",
  motherlode: "motherlode.wav",
  ledger: "ledger.wav",
  seal: "seal.wav",
  mimic: "mimic.wav",
  clang: "clang.wav",
  hit: "hit.wav",
  kill: "kill.wav",
  hurt: "hurt.wav",
  faint: "faint.wav",
  jump: "jump.wav",
  torch: "torch.wav",
  bolt: "bolt.wav",
  potion: "potion.wav",
  lift: "lift.wav",
  buy: "buy.wav",
  dash: "dash.wav",
  land: "land.wav",
  smash: "smash.wav",
  shatter: "shatter.wav",
} as const;

export type Sfx = keyof typeof SFX;

const VARIED = new Set<Sfx>(["dig", "crit", "break", "ore", "hit", "hurt", "clang", "jump", "kill", "dash", "land", "smash"]);
const PITCH_SPREAD = 0.12;
const MUSIC = "music.wav";
const SFX_VOLUME = 0.6;
const LEVELS: Partial<Record<Sfx, number>> = { break: 0.35 };
const MUSIC_VOLUME = 0.3;
const MIN_GAP_MS = 45;
const PREFS_KEY = "deepdelve-sound";
const MUSIC_ID = "deepdelve-music";

const existingTrack = () =>
  typeof document === "undefined" ? null : (document.getElementById(MUSIC_ID) as HTMLAudioElement | null);

function musicTrack() {
  const found = existingTrack();
  if (found) return found;
  const el = new Audio(DIR + MUSIC);
  el.id = MUSIC_ID;
  el.loop = true;
  el.volume = MUSIC_VOLUME;
  document.body.append(el);
  return el;
}

export type SoundPrefs = { music: boolean; sfx: boolean };

export function loadPrefs(): SoundPrefs {
  try {
    return { music: true, sfx: true, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") };
  } catch {
    return { music: true, sfx: true };
  }
}

let prefs = loadPrefs();
const bank = new Map<Sfx, HTMLAudioElement>();
const lastPlayed = new Map<Sfx, number>();
let wantMusic = false;

export function setPrefs(next: SoundPrefs) {
  prefs = next;
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  if (wantMusic && next.music) startMusic();
  else existingTrack()?.pause();
}

function sample(name: Sfx) {
  let base = bank.get(name);
  if (!base) {
    base = new Audio(DIR + SFX[name]);
    base.preload = "auto";
    bank.set(name, base);
  }
  return base;
}

export function preloadSounds() {
  for (const name of Object.keys(SFX) as Sfx[]) sample(name);
}

const onVisibility = () => {
  if (document.hidden) existingTrack()?.pause();
  else if (wantMusic) startMusic();
};

if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisibility);

import.meta.hot?.dispose(() => document.removeEventListener("visibilitychange", onVisibility));

export function play(name: Sfx) {
  if (!prefs.sfx) return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return;
  lastPlayed.set(name, now);
  const voice = sample(name).cloneNode() as HTMLAudioElement;
  voice.volume = SFX_VOLUME * (LEVELS[name] ?? 1);
  if (VARIED.has(name)) {
    voice.preservesPitch = false;
    voice.playbackRate = 1 + (Math.random() - 0.5) * PITCH_SPREAD;
  }
  void voice.play().catch(() => undefined);
}

export function startMusic() {
  wantMusic = true;
  if (!prefs.music) return;
  const track = musicTrack();
  if (track.paused) void track.play().catch(() => undefined);
}

export function stopMusic() {
  wantMusic = false;
  existingTrack()?.pause();
}
