import type { MiningConfig } from "@services/miningService";
import { alloyIcon, MATERIALS } from "./art/materials";
import { oreIcon } from "./render";

export const resourceOf = (config: MiningConfig, key: string) => {
  const i = config.ores.findIndex((o) => o.key === key);
  if (i >= 0) return { name: config.ores[i].name, grid: oreIcon(i), special: false };
  const a = config.alloys?.find((x) => x.key === key);
  if (a) return { name: a.name, grid: alloyIcon(a.tier, a.color), special: true };
  const m = MATERIALS[key];
  return { name: m?.name ?? key, grid: m?.grid ?? oreIcon(0), special: true };
};
