import type { CSSProperties } from "react";

export const magicGlowTheme = {
  palette: {
    primary: "rgba(180, 150, 255, 0.8)",
    secondary: "rgba(120, 200, 255, 0.6)",
    border: "rgba(180, 150, 255, 0.6)",
    shadow: "0 0 16px rgba(180, 150, 255, 0.35)",
  },
  card: {
    background: "linear-gradient(135deg, rgba(20, 18, 40, 0.9), rgba(30, 26, 60, 0.65))",
    border: "1px solid rgba(180, 150, 255, 0.6)",
    boxShadow: "0 0 16px rgba(180, 150, 255, 0.35)",
    backdropFilter: "blur(10px)",
  } as CSSProperties,
  outline: {
    borderColor: "rgba(180, 150, 255, 0.6)",
    boxShadow: "0 0 16px rgba(180, 150, 255, 0.35)",
  } as CSSProperties,
  badge: {
    boxShadow: "0 0 14px rgba(180, 150, 255, 0.45)",
    background: "linear-gradient(135deg, rgba(160,120,255,0.35), rgba(120,200,255,0.25))",
    border: "1px solid rgba(180, 150, 255, 0.6)",
  } as CSSProperties,
  text: {
    color: "#e5dbff",
    textShadow: "0 0 12px rgba(180, 150, 255, 0.5)",
  } as CSSProperties,
};
