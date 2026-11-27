const DIR = "/assets/sounds/mine/";

export const SFX = {
  dig: "dig.wav",
  crit: "crit.wav",
  break: "break.wav",
  ore: "ore.wav",
  discover: "discover.wav",
  full: "full.wav",
  chest: "chest.wav",
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
} as const;

export type Sfx = keyof typeof SFX;

const MUSIC = "music.wav";
const SFX_VOLUME = 0.6;
const MUSIC_VOLUME = 0.3;
const MIN_GAP_MS = 45;
const PREFS_KEY = "deepdelve-sound";

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
let track: HTMLAudioElement | null = null;
let wantMusic = false;

export function setPrefs(next: SoundPrefs) {
  prefs = next;
  localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  if (wantMusic && next.music) startMusic();
  else track?.pause();
}

export function play(name: Sfx) {
  if (!prefs.sfx) return;
  const now = performance.now();
  if (now - (lastPlayed.get(name) ?? -Infinity) < MIN_GAP_MS) return;
  lastPlayed.set(name, now);
  let base = bank.get(name);
  if (!base) {
    base = new Audio(DIR + SFX[name]);
    base.preload = "auto";
    bank.set(name, base);
  }
  const voice = base.cloneNode() as HTMLAudioElement;
  voice.volume = SFX_VOLUME;
  void voice.play().catch(() => undefined);
}

export function startMusic() {
  wantMusic = true;
  if (!prefs.music) return;
  if (!track) {
    track = new Audio(DIR + MUSIC);
    track.loop = true;
    track.volume = MUSIC_VOLUME;
  }
  if (track.paused) void track.play().catch(() => undefined);
}

export function stopMusic() {
  wantMusic = false;
  track?.pause();
}
