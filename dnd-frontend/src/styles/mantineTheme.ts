import {
  colorsTuple,
  createTheme,
  Autocomplete,
  ColorInput,
  Loader,
  Menu,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  PasswordInput,
  Popover,
  SegmentedControl,
  Select,
  Tabs,
  TagsInput,
  Textarea,
  TextInput,
  Tooltip,
  type CSSVariablesResolver,
} from "@mantine/core";
import { RuneLoader } from "@components/common/RuneLoader";

// Default look for every Mantine input / dropdown / modal / paper.
// Styles live in glassyInput.css; theme CSS variables come from the theme class on <html> (see App.tsx).
const input = { input: "glassy-input", label: "glassy-label" };
const combobox = { ...input, dropdown: "glassy-dropdown", option: "glassy-option" };

export const mantineTheme = createTheme({
  // The admin console's neons (adminCyber.css): color="neon" | "magenta" | "electric".
  colors: {
    neon: colorsTuple("#00ff88"),
    magenta: colorsTuple("#ff00ff"),
    electric: colorsTuple("#00d4ff"),
  },
  components: {
    TextInput: TextInput.extend({ classNames: input }),
    NumberInput: NumberInput.extend({ classNames: input }),
    PasswordInput: PasswordInput.extend({ classNames: input }),
    Textarea: Textarea.extend({ classNames: input }),
    Select: Select.extend({ classNames: combobox }),
    MultiSelect: MultiSelect.extend({ classNames: combobox }),
    Autocomplete: Autocomplete.extend({ classNames: combobox }),
    TagsInput: TagsInput.extend({ classNames: combobox }),
    // Mantine leaves the swatch catching clicks, so only the hex text opened the picker; let them through to the input.
    ColorInput: ColorInput.extend({ defaultProps: { leftSectionPointerEvents: "none" } }),
    Modal: Modal.extend({ classNames: { content: "glass-modal" } }),
    Tabs: Tabs.extend({ classNames: { root: "glassy-tabs", tab: "glassy-tab" } }),
    Menu: Menu.extend({ classNames: { item: "glassy-menu-item", divider: "glassy-menu-divider" } }),
    // Also the dropdown of every Menu, which is a Popover underneath.
    Popover: Popover.extend({ classNames: { dropdown: "glassy-menu" } }),
    Tooltip: Tooltip.extend({ classNames: { tooltip: "glassy-tooltip" } }),
    SegmentedControl: SegmentedControl.extend({ classNames: { root: "glassy-sc" } }),
    Paper: Paper.extend({ classNames: { root: "glass-paper" } }),
    // Every <Loader /> (and Button/ActionIcon `loading`) renders the themed rune circle.
    Loader: Loader.extend({ defaultProps: { loaders: { ...Loader.defaultLoaders, rune: RuneLoader }, type: "rune" } }),
  },
});

/**
 * Mantine's dark greys and default blue, pointed at the active theme's tokens (theme.css), so anything
 * new — a default or gray button, a hover, a checkbox, a tab underline — matches the theme without
 * per-component styling. Fallbacks are Mantine's own values, for a page with no theme class yet.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--mantine-primary-color-filled": "var(--theme-color-accent-primary, var(--mantine-color-blue-filled))",
    "--mantine-primary-color-filled-hover": "var(--theme-color-accent-primary, var(--mantine-color-blue-filled-hover))",
    "--mantine-primary-color-light": "var(--theme-bg-hover, var(--mantine-color-blue-light))",
    "--mantine-primary-color-light-hover": "var(--theme-border-glow, var(--mantine-color-blue-light-hover))",
    "--mantine-primary-color-light-color": "var(--theme-color-text-glow, var(--mantine-color-blue-light-color))",
  },
  light: {},
  dark: {
    "--mantine-primary-color-contrast": "var(--theme-color-text-on-accent, var(--mantine-color-white))",
    "--mantine-color-default": "var(--theme-bg-card, var(--mantine-color-dark-6))",
    "--mantine-color-default-hover": "var(--theme-bg-hover, var(--mantine-color-dark-5))",
    "--mantine-color-default-border": "var(--theme-border-subtle, var(--mantine-color-dark-4))",
    "--mantine-color-gray-light": "var(--theme-bg-card, rgba(134, 142, 150, 0.15))",
    "--mantine-color-gray-light-hover": "var(--theme-bg-hover, rgba(134, 142, 150, 0.2))",
  },
});
