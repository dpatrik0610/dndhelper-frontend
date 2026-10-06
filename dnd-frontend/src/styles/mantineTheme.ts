import {
  colorsTuple,
  createTheme,
  Autocomplete,
  Loader,
  Modal,
  MultiSelect,
  NumberInput,
  Paper,
  PasswordInput,
  Select,
  TagsInput,
  Textarea,
  TextInput,
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
    Modal: Modal.extend({ classNames: { content: "glass-modal" } }),
    Paper: Paper.extend({ classNames: { root: "glass-paper" } }),
    // Every <Loader /> (and Button/ActionIcon `loading`) renders the themed rune circle.
    Loader: Loader.extend({ defaultProps: { loaders: { ...Loader.defaultLoaders, rune: RuneLoader }, type: "rune" } }),
  },
});
