import { Drawer } from "@mantine/core";
import { useLocation } from "react-router-dom";
import { useIsDm } from "@store/campaign/campaignSelectors";
import { getActiveThemeClass, type SidebarThemeVariant } from "@appTypes/ThemeTypes";
import { navSections } from "./navItems";
import { CharacterCard } from "./components/CharacterCard";
import { CampaignSwitcher } from "./components/CampaignSwitcher";
import { NavSection } from "./components/NavSection";
import { SidebarFooter } from "./components/SidebarFooter";
import classes from "./Sidebar.module.css";

interface SidebarProps {
  opened: boolean;
  onClose: () => void;
  themeVariant?: SidebarThemeVariant;
}

export default function Sidebar({ opened, onClose, themeVariant = "midnight" }: SidebarProps) {
  const isDm = useIsDm();
  const { pathname } = useLocation();

  // "/" renders Home; "/spells/Fireball" belongs to "/spells"
  const path = pathname === "/" ? "/home" : pathname;
  const activeLink = navSections.flatMap((s) => s.items).find((item) => path.startsWith(item.link))?.link;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="left"
      padding={14}
      size="280px" // SidebarToggle's DRAWER_WIDTH rides this edge; phones too, so the page stays visible beside it
      overlayProps={{ color: "#000", backgroundOpacity: 0.5, blur: 4 }}
      withCloseButton={false}
      zIndex={198} // just under SidebarToggle (199), which closes it
      // The theme class sits here too: /dashboard renders without one on <html>
      classNames={{ content: `${classes.drawer} ${getActiveThemeClass(themeVariant)}`, body: classes.body }}
    >
      <CampaignSwitcher />
      <CharacterCard />

      <nav className={classes.nav} aria-label="Main">
        {navSections
          .filter((section) => !section.dmOnly || isDm)
          .map((section) => (
            <NavSection key={section.label ?? "root"} section={section} activeLink={activeLink} onNavigate={onClose} />
          ))}
      </nav>

      <SidebarFooter onNavigate={onClose} />
    </Drawer>
  );
}
