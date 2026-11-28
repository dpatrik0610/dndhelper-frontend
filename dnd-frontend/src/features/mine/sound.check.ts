// Self-check: npx esbuild src/features/mine/sound.check.ts --bundle --platform=node --tsconfig=tsconfig.app.json | node
import assert from "node:assert/strict";
import { loadPrefs, setPrefs } from "@features/mine/sound";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  },
});

const defaults = { music: true, sfx: true, musicVolume: 0.3, sfxVolume: 0.6 };
assert.deepEqual(loadPrefs(), defaults);

storage.set("deepdelve-sound", '{"music":false,"sfx":true}');
assert.deepEqual(loadPrefs(), { ...defaults, music: false });

storage.set("deepdelve-sound", '{"musicVolume":-1,"sfxVolume":2}');
assert.deepEqual(loadPrefs(), defaults);

storage.set("deepdelve-sound", '{"musicVolume":"0.5","sfxVolume":null}');
assert.deepEqual(loadPrefs(), defaults);

storage.set("deepdelve-sound", "{");
assert.deepEqual(loadPrefs(), defaults);

const custom = { ...defaults, musicVolume: 0, sfxVolume: 1 };
setPrefs(custom);
assert.deepEqual(loadPrefs(), custom);

console.log("Deep Delve audio preferences passed");
