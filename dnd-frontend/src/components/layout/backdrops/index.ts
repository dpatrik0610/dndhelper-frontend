import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SidebarThemeVariant } from "@appTypes/ThemeTypes";

export interface BackdropProps {
  /** No motion (mobile): keep the scene, stop all animation. */
  isStatic?: boolean;
}

type Backdrop = LazyExoticComponent<ComponentType<BackdropProps>>;

/**
 * Theme → background scene. Each scene is its own chunk, so only the active theme's code is
 * downloaded. Scene styles live in styles/themes/<theme>.css. Themes without an entry show only
 * the shared glow + particles.
 */
export const themeBackdrops: Partial<Record<SidebarThemeVariant, Backdrop>> = {
  cyberpunk: lazy(() => import("./CyberpunkBackdrop").then((m) => ({ default: m.CyberpunkBackdrop }))),
  "frost-glacier": lazy(() => import("./FrostBackdrop").then((m) => ({ default: m.FrostBackdrop }))),
  steampunk: lazy(() => import("./ClockworkBackdrop").then((m) => ({ default: m.ClockworkBackdrop }))),
  sunset: lazy(() => import("./CyberFantasyBackdrop").then((m) => ({ default: m.CyberFantasyBackdrop }))),
  midnight: lazy(() => import("./MidnightBackdrop").then((m) => ({ default: m.MidnightBackdrop }))),
  "crimson-vampire": lazy(() => import("./CrimsonBackdrop").then((m) => ({ default: m.CrimsonBackdrop }))),
  "deep-ocean": lazy(() => import("./DeepOceanBackdrop").then((m) => ({ default: m.DeepOceanBackdrop }))),
  feywild: lazy(() => import("./FeywildBackdrop").then((m) => ({ default: m.FeywildBackdrop }))),
  toxic: lazy(() => import("./ToxicBackdrop").then((m) => ({ default: m.ToxicBackdrop }))),
  void: lazy(() => import("./VoidBackdrop").then((m) => ({ default: m.VoidBackdrop }))),
  darkvision: lazy(() => import("./DarkvisionBackdrop").then((m) => ({ default: m.DarkvisionBackdrop }))),
};
