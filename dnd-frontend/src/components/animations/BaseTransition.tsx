import { AnimatePresence, motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

type TransitionVariant = "slide" | "fade" | "scale";
type TransitionMode = "sync" | "wait" | "popLayout";

interface BaseTransitionProps {
  show: boolean;
  children: ReactNode;
  mode?: TransitionMode;
  variant?: TransitionVariant;
  layout?: boolean;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  exit?: MotionProps["exit"];
  transition?: MotionProps["transition"];
}

const defaultTransition = { duration: 0.18, ease: "easeInOut" as const };
const variants: Record<TransitionVariant, {
  initial: MotionProps["initial"];
  animate: MotionProps["animate"];
  exit: MotionProps["exit"];
}> = {
  slide: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.97 },
  },
};

export function BaseTransition({
  show,
  children,
  mode = "wait",
  variant = "slide",
  layout = true,
  initial,
  animate,
  exit,
  transition = defaultTransition,
}: BaseTransitionProps) {
  const preset = variants[variant] ?? variants.slide;
  const resolvedInitial = initial ?? preset.initial;
  const resolvedAnimate = animate ?? preset.animate;
  const resolvedExit = exit ?? preset.exit;

  return (
    <AnimatePresence mode={mode} initial={false}>
      {show && (
        <motion.div
          layout={layout}
          initial={resolvedInitial}
          animate={resolvedAnimate}
          exit={resolvedExit}
          transition={transition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
