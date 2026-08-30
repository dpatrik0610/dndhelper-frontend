import { forwardRef } from "react";
import { ActionIcon } from "@mantine/core";
import { useIsMobile } from "@hooks/useIsMobile";
import { motion } from "framer-motion";

interface ActionBubbleProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string; // Bubble tint color (e.g., violet, teal, amber)
}

export const ActionBubble = forwardRef<HTMLButtonElement, ActionBubbleProps>(
  ({ label, icon, onClick, color = "rgba(121, 80, 242, 0.25)" }, ref) => {
    const isMobile = useIsMobile();
    const size = isMobile ? 38 : 44;

    return (
      <motion.div
        whileHover={{ scale: 1.1, translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        style={{ display: "inline-block" }}
      >
        <ActionIcon
          ref={ref}
          onClick={onClick}
          aria-label={label}
          style={{
            position: "relative",
            width: size,
            height: size,
            borderRadius: "50%",
            // 3D Glass Bubble Look:
            // Highlight spot at 30%, completely clear/transparent center (0.02 opacity), 
            // and the color tint concentrated on the outer edges (80% stop) to simulate curved glass refraction.
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.02) 50%, ${color} 80%, rgba(0, 0, 0, 0.35) 100%)`,
            // Crisp bubble rim/edge
            border: "1px solid rgba(255, 255, 255, 0.22)",
            // Intricate shadow layers for depth and volume (softer and more glass-like)
            boxShadow: `
              inset 0 -2px 6px rgba(0, 0, 0, 0.3), 
              inset 0 2px 6px rgba(255, 255, 255, 0.15), 
              0 4px 10px rgba(0, 0, 0, 0.15)
            `,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "box-shadow 0.2s ease, background 0.2s ease",
          }}
        >
          {/* Centered Icon with high contrast drop shadow */}
          <div
            style={{
              zIndex: 2,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))",
            }}
          >
            {icon}
          </div>

          {/* Glassy Top-Left Arc Highlight */}
          <div
            style={{
              position: "absolute",
              top: "8%",
              left: "12%",
              width: "45%",
              height: "22%",
              background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 80%)",
              borderRadius: "50%",
              transform: "rotate(-30deg)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />

          {/* Bottom-Right Bounce Light Reflection */}
          <div
            style={{
              position: "absolute",
              bottom: "8%",
              right: "12%",
              width: "25%",
              height: "25%",
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
              borderRadius: "50%",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        </ActionIcon>
      </motion.div>
    );
  }
);

ActionBubble.displayName = "ActionBubble";
