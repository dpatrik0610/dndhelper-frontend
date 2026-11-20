import { forwardRef, type CSSProperties } from "react";
import { motion } from "motion/react";
import { useIsMobile } from "@hooks/useIsMobile";
import classes from "./ActionBubble.module.css";

interface ActionBubbleProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  color?: string;
}

export const ActionBubble = forwardRef<HTMLButtonElement, ActionBubbleProps>(
  ({ label, icon, onClick, color }, ref) => {
    const isMobile = useIsMobile();
    const style = {
      "--bubble-size": `${isMobile ? 50 : 60}px`,
      ...(color && { "--bubble-color": color }),
    } as CSSProperties;

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
        <button ref={ref} type="button" onClick={onClick} aria-label={label} className={classes.bubble} style={style}>
          <span className={classes.icon} aria-hidden>
            {icon}
          </span>
        </button>
      </motion.div>
    );
  }
);

ActionBubble.displayName = "ActionBubble";
