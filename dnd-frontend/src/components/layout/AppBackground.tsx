import { useMemo } from "react";
import { Box } from "@mantine/core";
import { useIsMobile } from "@hooks/useIsMobile";

/**
 * AppBackground
 * 
 * The global living backdrop for the application.
 * Optimized with high-performance CSS hardware acceleration variables, 
 * lightweight blur radii, and minimal, GPU-composited particle arrays
 * to run at a locked, stutter-free 60FPS on both desktop and mobile devices.
 */
export function AppBackground() {
  const isMobile = useIsMobile();

  // Optimized down to 14/5 particles to completely eliminate DOM layout calculation overhead
  const particles = useMemo(() => {
    const count = isMobile ? 5 : 14;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${15 + Math.random() * 15}s`, // Slower, more calming drift speeds
      size: `${2 + Math.random() * 2.5}px`,
    }));
  }, [isMobile]);

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
