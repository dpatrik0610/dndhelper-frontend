import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import "@mantine/core/styles.css";
import "./styles/glassyInput.css";
import "./styles/index.css";
import "./styles/theme.css";
import "./styles/themes/index.css";
import { mantineTheme } from "./styles/mantineTheme";
import { getActiveThemeClass } from "@appTypes/ThemeTypes";
import { useUiStore } from "@store/ui/uiStore";
import { CharacterSelectModal } from "@features/home/components/CharacterSelectModal";
import type { Character } from "@appTypes/Character/Character";

const n = Number(new URLSearchParams(location.search).get("n") ?? 8);
useUiStore.setState({ sidebarTheme: "toxic" });
document.documentElement.classList.add(getActiveThemeClass("toxic"), "style-variant-glass");
const rows: [string, string, string, number][] = [["Leo", "Celestial", "Celestial", 10], ["Mick", "Mousefolk", "Wizard(4)+Cleric(1)", 5], ["Shiro", "Tabaxi Lynx", "Rogue", 5], ["Eryn", "Elf", "Paladin", 4], ["Lenry", "Lizardfolk", "Artificer", 5], ["Talon Marsh", "Human", "Ranger", 5], ["Laena", "Tribixi", "Fighter", 6], ["Vrul", "Demon", "NPC", 1]];
const characters = rows.slice(0, n).map(([name, race, characterClass, level], i) => ({ id: "c" + i, name, race, characterClass, level, imageUrl: "" }) as unknown as Character);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <MantineProvider defaultColorScheme="dark" theme={mantineTheme}>
    <BrowserRouter><CharacterSelectModal opened onClose={() => {}} characters={characters} onSelect={() => {}} /></BrowserRouter>
  </MantineProvider>
);
