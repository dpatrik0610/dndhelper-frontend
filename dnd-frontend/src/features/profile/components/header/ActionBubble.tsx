import { forwardRef, useState } from "react";
import { Box } from "@mantine/core";
import { motion } from "framer-motion";
import { useIsMobile } from "@hooks/useIsMobile";

interface ActionBubbleProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  color?: string;
}

export const ActionBubble = forwardRef<HTMLButtonElement, ActionBubbleProps>(
  ({ label, icon, onClick, color }, ref) => {
    const isMobile = useIsMobile();
    const [hovered, setHovered] = useState(false);
    const size = isMobile ? 50 : 60;

    const resolvedActiveColor = color || "var(--theme-color-accent-primary, #f59e0b)";

    return (
      <motion.div
        whileHover={{ scale: 1.1, translateY: -2 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: "1 1 auto",
        }}
      >
        <Box
          ref={ref as any}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={label}
          style={{
            position: "relative",
            width: size,
            height: size,
            borderRadius: "70%",
            background: hovered
              ? resolvedActiveColor
              : "var(--theme-bg-card, rgba(255, 255, 255, 0.04))",
            border: hovered
              ? `1px solid ${resolvedActiveColor}`
              : "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08))",
            boxShadow: hovered
              ? `0 0 16px ${resolvedActiveColor}, var(--theme-glow-shadow-primary)`
              : "inset 0 1px 1.5px rgba(255, 255, 255, 0.08), 0 2px 8px rgba(0, 0, 0, 0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: hovered ? "#121214" : "var(--theme-color-accent-secondary, #06b6d4)",
              transition: "color 0.15s ease",
            }}
          >
            {icon}
          </Box>
        </Box>
      </motion.div>
    );
  }
);

ActionBubble.displayName = "ActionBubble";
