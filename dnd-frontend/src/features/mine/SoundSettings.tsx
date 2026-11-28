import { Switch } from "@mantine/core";
import { PanelHead } from "@features/mine/CampMenus";
import styles from "@features/mine/Mine.module.css";
import { getPrefs, setPrefs } from "@features/mine/sound";
import { useState } from "react";

const SWITCH_CLASSES = { root: "sq-switch", track: "sq-switch-track", thumb: "sq-switch-thumb" };
const CHANNELS = [
  { label: "Music", enabled: "music", volume: "musicVolume" },
  { label: "Effects", enabled: "sfx", volume: "sfxVolume" },
] as const;

export function SoundSettings({ onClose }: { onClose: () => void }) {
  const [sound, setSound] = useState(getPrefs);

  const update = (next: typeof sound) => {
    setSound(next);
    setPrefs(next);
  };

  return (
    <section className={styles.hudPanel} aria-label="Settings">
      <PanelHead title="Settings" onClose={onClose} />
      {CHANNELS.map(({ label, enabled, volume }) => {
        const percent = Math.round(sound[volume] * 100);
        return (
          <div key={enabled} className={styles.soundSetting}>
            <Switch
              classNames={SWITCH_CLASSES}
              label={label}
              checked={sound[enabled]}
              onChange={(e) => update({ ...sound, [enabled]: e.currentTarget.checked })}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={percent}
              disabled={!sound[enabled]}
              aria-label={`${label} volume`}
              aria-valuetext={`${percent}%`}
              onChange={(e) => update({ ...sound, [volume]: e.currentTarget.valueAsNumber / 100 })}
            />
            <span aria-hidden="true">{percent}%</span>
          </div>
        );
      })}
    </section>
  );
}
