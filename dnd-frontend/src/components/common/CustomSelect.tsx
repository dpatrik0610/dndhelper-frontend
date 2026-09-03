import React from "react";
import { Select, type SelectProps } from "@mantine/core";
import { useUiStore } from "@store/ui/uiStore";
import { getActiveThemeClass } from "@appTypes/ThemeTypes";

export function CustomSelect(props: SelectProps) {
  const sidebarTheme = useUiStore((s) => s.sidebarTheme);
  const activeThemeClass = getActiveThemeClass(sidebarTheme);

  return (
    <Select
      allowDeselect={false}
      {...props}
      className={`${activeThemeClass} ${props.className || ""}`}
      comboboxProps={{
        popoverProps: {
          className: `${activeThemeClass} ${props.comboboxProps?.popoverProps?.className || ""}`,
          ...props.comboboxProps?.popoverProps,
        },
        ...props.comboboxProps,
      }}
      styles={{
        input: {
          background: "rgba(255, 255, 255, 0.02) !important",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.08)) !important",
          color: "var(--theme-color-text-primary, #ffffff) !important",
          fontFamily: '"Inter", sans-serif',
        },
        dropdown: {
          background: "var(--theme-bg-panel-opaque, rgba(15, 15, 15, 0.98)) !important",
          backdropFilter: "blur(24px) saturate(130%) !important",
          WebkitBackdropFilter: "blur(24px) saturate(130%) !important",
          border: "1px solid var(--theme-border-subtle, rgba(255, 255, 255, 0.1)) !important",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6) !important",
        },
        option: {
          color: "rgba(255, 255, 255, 0.75) !important",
          fontFamily: '"Inter", sans-serif',
          fontSize: "13px",
          transition: "all 0.15s ease",
          "&[data-hovered]": {
            background: "var(--theme-bg-hover, rgba(168, 85, 247, 0.14)) !important",
            color: "var(--theme-color-text-primary, #ffffff) !important",
          },
          "&[data-selected]": {
            background: "var(--theme-gradient-primary-glass, rgba(245, 158, 11, 0.18)) !important",
            color: "var(--theme-color-accent-primary, #f59e0b) !important",
            fontWeight: "600 !important" as any,
          },
        },
        ...props.styles,
      }}
    />
  );
}
