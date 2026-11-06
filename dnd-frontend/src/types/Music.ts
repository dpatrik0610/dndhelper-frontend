export type Repeat = "off" | "all" | "one";
export type Easing = "inOut" | "in" | "out";
export type SkipKind = "next" | "prev";

export interface QueuedSong {
  id: string;
  title: string;
  artist: string | null;
  cover: string | null;
  duration: number;
  collection: string;
}

export interface MusicVote {
  id: string;
  kind: SkipKind;
  by: string;
  byName: string;
  track: string;
  index: number;
  eligible: number;
  yes: string[];
  no: string[];
  status: "open" | "passed" | "failed" | "cancelled";
  startedAt: number;
  endsAt: number;
  closedAt: number | null;
  decidedBy: "dm" | "vote" | "time" | null;
}

export interface SoundingAmbience {
  collection: string;
  name: string;
  layers: { id: string; name: string; level: number; url: string }[];
}

export interface MusicSettings {
  crossfade: number;
  easing: Easing;
  softPause: boolean;
}

export interface MusicState {
  rev: number;
  fade: MusicSettings;
  ambience: SoundingAmbience | null;
  track: (QueuedSong & { url: string }) | null;
  nextUrl: string | null;
  index: number;
  queue: QueuedSong[];
  playing: boolean;
  startedAt: number;
  position: number;
  shuffle: boolean;
  repeat: Repeat;
  vote: MusicVote | null;
}

export interface LibrarySong {
  id: string;
  title: string;
  artist: string | null;
  cover: string | null;
  url: string | null;
  duration: number;
}

export interface LibraryLayer {
  id: string;
  name: string;
  level: number;
  on: boolean;
  url: string | null;
}

export interface MusicLibrary {
  inbox: { id: string | null; name: string; songs: LibrarySong[] };
  settings: MusicSettings;
  ambience: string | null;
  situations: { id: string; name: string; songs: LibrarySong[]; layers: LibraryLayer[] }[];
}
