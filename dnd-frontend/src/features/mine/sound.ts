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
  squish: "squish.wav",
  achievement: "achievement.wav",
} as const;

export type Sfx = keyof typeof SFX;

const VARIED = new Set<Sfx>(["dig", "crit", "break", "ore", "hit", "hurt", "clang", "jump", "kill", "dash", "land", "smash"]);
const PITCH_SPREAD = 0.12;
const MUSIC = "music.wav";
const LEVELS: Partial<Record<Sfx, number>> = { break: 0.35 };
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
  el.volume = prefs.musicVolume;
  document.body.append(el);
  return el;
}

export type SoundPrefs = { music: boolean; sfx: boolean; musicVolume: number; sfxVolume: number };

const DEFAULT_PREFS: SoundPrefs = { music: true, sfx: true, musicVolume: 0.3, sfxVolume: 0.6 };

function savedVolume(value: unknown, fallback: number) {
  return typeof value === "number" && value >= 0 && value <= 1 ? value : fallback;
}

export function loadPrefs(): SoundPrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null") as Partial<SoundPrefs> | null;
    return {
      music: typeof saved?.music === "boolean" ? saved.music : DEFAULT_PREFS.music,
      sfx: typeof saved?.sfx === "boolean" ? saved.sfx : DEFAULT_PREFS.sfx,
      musicVolume: savedVolume(saved?.musicVolume, DEFAULT_PREFS.musicVolume),
      sfxVolume: savedVolume(saved?.sfxVolume, DEFAULT_PREFS.sfxVolume),
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

let prefs = loadPrefs();
const bank = new Map<Sfx, HTMLAudioElement>();
const lastPlayed = new Map<Sfx, number>();
let wantMusic = false;

export function getPrefs() {
  return prefs;
}

export function setPrefs(next: SoundPrefs) {
  prefs = next;
  const track = existingTrack();
  if (track) track.volume = next.musicVolume;
  if (wantMusic && next.music) startMusic();
  else track?.pause();

  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  } catch {
    // Playback settings still apply when browser storage is unavailable.
  }
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
  if (!prefs.sfx || prefs.sfxVolume === 0) return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return;
  lastPlayed.set(name, now);
  const voice = sample(name).cloneNode() as HTMLAudioElement;
  voice.volume = prefs.sfxVolume * (LEVELS[name] ?? 1);
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
