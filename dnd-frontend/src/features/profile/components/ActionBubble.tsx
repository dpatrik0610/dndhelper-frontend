import { forwardRef } from "react";
import { ActionIcon } from "@mantine/core";
import { useIsMobile } from "@hooks/useIsMobile";
import { motion } from "framer-motion";

interface ActionBubbleProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

export const ActionBubble = forwardRef<HTMLButtonElement, ActionBubbleProps>(
  ({ label, icon, onClick, color }, ref) => {
    const isMobile = useIsMobile();
    const size = isMobile ? 38 : 44;

    const resolvedActiveColor = color || "var(--theme-color-accent-primary, #f59e0b)";

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
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.0) 50%, rgba(0, 0, 0, 0.15) 100%)",
            border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.04))",
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.06)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = resolvedActiveColor;
            e.currentTarget.style.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)`;
            e.currentTarget.style.boxShadow = `0 0 18px ${resolvedActiveColor}, inset 0 1px 1px rgba(255, 255, 255, 0.12), 0 6px 20px rgba(0, 0, 0, 0.25)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--theme-border-subtle, rgba(255, 255, 255, 0.04))";
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.0) 50%, rgba(0, 0, 0, 0.15) 100%)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.06)";
          }}
        >
          <div
            style={{
              zIndex: 2,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))",
            }}
          >
            {icon}
          </div>

          <div
            style={{
              position: "absolute",
              top: "6%",
              left: "12%",
              width: "45%",
              height: "22%",
              background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 80%)",
              borderRadius: "50%",
              transform: "rotate(-30deg)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        </ActionIcon>
      </motion.div>
    );
  }
);

ActionBubble.displayName = "ActionBubble";
