import { useRef, useEffect, useCallback, useMemo, useState } from "react";
import { Box, Text, Stack } from "@mantine/core";

interface WheelPickerInputProps<T> {
  items: T[];
  value: T;
  onChange: (v: T) => void;
  height?: number;
  label?: string;
  getLabel?: (item: T) => string;
}

const ITEM_HEIGHT = 30;

export function WheelPickerInput<T>({
  items,
  value,
  onChange,
  height = ITEM_HEIGHT * 5,
  label,
  getLabel = (i) => String(i),
}: WheelPickerInputProps<T>) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const snapTimeout = useRef<number | null>(null);

  // 🔧 FIX: used only to force rerender immediately after initial scroll update
  const [, forceRender] = useState(0);

  const values = useMemo(() => {
    const visibleRows = Math.floor(height / ITEM_HEIGHT);
    const spacerCount = Math.floor(visibleRows / 2);
    return [
      ...Array(spacerCount).fill(null),
      ...items,
      ...Array(spacerCount).fill(null),
    ];
  }, [items, height]);

  const visibleRows = Math.floor(height / ITEM_HEIGHT);
  const spacerCount = Math.floor(visibleRows / 2);
  const centerOffset = (height - ITEM_HEIGHT) / 2;

  const scrollToValue = useCallback(
    (val: T, smooth = false) => {
      const wheel = wheelRef.current;
      if (!wheel) return;

      const index = values.indexOf(val);
      if (index < 0) return;

      wheel.scrollTo({
        top: index * ITEM_HEIGHT - centerOffset,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [values, centerOffset]
  );

  useEffect(() => {
    scrollToValue(value, false);
    forceRender((x) => x + 1); // 🔧 FIX: ensures correct style on first paint
  }, [value, scrollToValue]);

  const handleScroll = useCallback(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    if (snapTimeout.current) clearTimeout(snapTimeout.current);

    snapTimeout.current = window.setTimeout(() => {
      const top = wheel.scrollTop;
      const approxIndex = Math.round((top + centerOffset) / ITEM_HEIGHT);

      const bounded = Math.max(
        spacerCount,
        Math.min(values.length - spacerCount - 1, approxIndex)
      );

      const newVal = values[bounded] as T;

      if (newVal !== value) onChange(newVal);

      wheel.scrollTo({
        top: bounded * ITEM_HEIGHT - centerOffset,
        behavior: "smooth",
      });
    }, 80);
  }, [value, onChange, values, centerOffset, spacerCount]);

  const getWrapperStyle = useCallback(
    (index: number) => {
      const wheel = wheelRef.current;
      if (!wheel) return {};

      const top = wheel.scrollTop;
      const centerScroll = top + centerOffset;
      const itemCenter = index * ITEM_HEIGHT;

      const dist = Math.abs(centerScroll - itemCenter);
      const ratio = Math.min(dist / ITEM_HEIGHT, 1);

      const rotateX = ratio * 30;
      const opacity = 0.35 + (1 - ratio) * 0.65;

      return {
        height: ITEM_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `perspective(300px) rotateX(${rotateX}deg)`,
        opacity,
        transition: "transform 0.12s linear, opacity 0.12s linear",
        userSelect: "none",
      } as const;
    },
    [centerOffset]
  );

  return (
    <Stack gap={4} w="100%">
      {label && (
        <Text size="sm" c="gray.5" style={{ userSelect: "none" }}>
          {label}
        </Text>
      )}

      <Box
        h={height}
        pos="relative"
        style={{
          overflow: "hidden",
          borderRadius: 10,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.35), inset 0 0 20px rgba(255,255,255,0.06)",
        }}
      >
        <Box
          pos="absolute"
          top={centerOffset}
          h={ITEM_HEIGHT}
          w="100%"
          style={{
            background: "rgba(255,255,255,0.06)",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(3px)",
            pointerEvents: "none",
          }}
        />

        <Box
          ref={wheelRef}
          onScroll={handleScroll}
          h="100%"
          style={{
            overflowY: "scroll",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
          }}
        >
          {values.map((v, i) =>
            v === null ? (
              <Box key={i} h={ITEM_HEIGHT} />
            ) : (
              <Box key={i} style={getWrapperStyle(i)}>
                <Text fz={18} style={{ userSelect: "none", color: "#e8faff" }}>
                  {getLabel(v)}
                </Text>
              </Box>
            )
          )}
        </Box>
      </Box>
    </Stack>
  );
}
