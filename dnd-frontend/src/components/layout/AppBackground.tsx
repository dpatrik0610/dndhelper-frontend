import { Suspense, useMemo } from "react";
import { Box } from "@mantine/core";
import { useIsMobile } from "@hooks/useIsMobile";
import { useReduceMotion } from "@hooks/useReduceMotion";
import { useUiStore } from "@store/ui/uiStore";
import { getActiveThemeClass } from "@appTypes/ThemeTypes";
import { themeBackdrops } from "./backdrops";
import { ThemeCritter } from "./ThemeCritter";

export function AppBackground() {
  const isMobile = useIsMobile();
  const sidebarTheme = useUiStore((s) => s.sidebarTheme);
  const reduceMotion = useReduceMotion();
  const { animatedBackground, performanceMode } = useUiStore((s) => s.prefs);
  const animated = animatedBackground && !performanceMode && !reduceMotion && !isMobile;
  const activeThemeClass = useMemo(() => getActiveThemeClass(sidebarTheme), [sidebarTheme]);
  const backgroundClass = `portal-background ${activeThemeClass}${animated ? "" : " portal-background--static"}`;
  const Backdrop = themeBackdrops[sidebarTheme];
  const scene = Backdrop && (
    <Suspense fallback={null}>
      <Backdrop isStatic={!animated} />
    </Suspense>
  );

  const particles = useMemo(() => {
    if (!animated) return [];
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${15 + Math.random() * 15}s`,
      size: `${2 + Math.random() * 2.5}px`,
    }));
  }, [animated]);

  if (isMobile) {
    return (
      <Box
        className={backgroundClass}
        style={{
          position: "fixed",
          inset: 0,
          background: "#050507",
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 50%, var(--theme-bg-panel, rgba(124, 58, 237, 0.05)) 0%, #030305 100%)",
            opacity: 0.8,
            zIndex: 1,
          }}
        />
        {scene}
      </Box>
    );
  }

  return (
    <>
    {animated && <ThemeCritter key={sidebarTheme} theme={sidebarTheme} />}
    <Box className={backgroundClass} style={{ position: "fixed", pointerEvents: "none" }}>
      <Box className="portal-backdrop-glow" />
      {scene}

      <Box className="portal-particles">
        {particles.map((p) => (
          <Box
            key={p.id}
            className="portal-particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
            }}
          />
        ))}
      </Box>
    </Box>
    </>
  );
}
