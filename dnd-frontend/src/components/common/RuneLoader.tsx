import { forwardRef } from "react";
import { Box } from "@mantine/core";

/**
 * Arcane rune-circle loader, registered as Mantine's default Loader type (see styles/mantineTheme.ts),
 * so every <Loader /> and every Button/ActionIcon `loading` state uses it. Pure CSS (styles/loaders.css):
 * a comet arc sweeping the outer ring, a counter-rotating ring of rune ticks, and a pulsing core.
 * Scales with Mantine's --loader-size; uses the theme accent (inside buttons: the button's text colour).
 */
export const RuneLoader = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...others }, ref) => (
    <Box component="span" className={`rune-loader ${className ?? ""}`} {...others} ref={ref}>
      <span className="rune-loader__core" />
    </Box>
  )
);
RuneLoader.displayName = "RuneLoader";
