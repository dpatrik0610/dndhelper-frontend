import { useMemo } from "react";
import { Box } from "@mantine/core";
import { useIsMobile } from "@hooks/useIsMobile";

/**
 * AppBackground
 * 
 * The global living backdrop for the application.
 * Fully optimized to run at locked, stutter-free 60FPS.
 * On mobile devices, all active animations, particle generators, and costly blur filters 
 * are disabled to conserve mobile CPU/GPU performance and battery life, while preserving
 * a static theme-reactive visual style.
 */
export function AppBackground() {
  const isMobile = useIsMobile();

  // Optimized particle generation for desktop devices only
  const particles = useMemo(() => {
    if (isMobile) return [];
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${15 + Math.random() * 15}s`, // Slower, more calming drift speeds
      size: `${2 + Math.random() * 2.5}px`,
    }));
  }, [isMobile]);

  // High-performance static themed backdrop for mobile to completely bypass layout calculation, blurs, and animation threads
  if (isMobile) {
    return (
      <Box
        className="portal-background"
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
      </Box>
    );
  }

  return (
    <Box className="portal-background" style={{ position: "fixed", pointerEvents: "none" }}>
      <Box className="portal-backdrop-glow" />
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
  );
}
