import { useState, type CSSProperties } from "react";
import { Drawer, type MantineTransition } from "@mantine/core";
import { useLocation } from "react-router-dom";
import { useIsDm } from "@store/campaign/campaignSelectors";
import { useIsSuperAdmin } from "@store/auth/authSelectors";
import { getActiveThemeClass, type SidebarThemeVariant } from "@appTypes/ThemeTypes";
import { navSections } from "./navItems";
import { CharacterCard } from "./components/CharacterCard";
import { CampaignSwitcher } from "./components/CampaignSwitcher";
import { NavSection } from "./components/NavSection";
import { SidebarFooter } from "./components/SidebarFooter";
import { SidebarToggle } from "@components/layout/SidebarToggle";
import classes from "./Sidebar.module.css";

interface SidebarProps {
  opened: boolean;
  onOpenedChange: (opened: boolean) => void;
  themeVariant?: SidebarThemeVariant;
}

/** Solid slide (no fade, so it reads as one piece with the tab). Also transitions `translate`, the drag offset,
 *  so a released drag glides to rest with the same timing as the tab (SidebarToggle.module.css). */
const SLIDE: MantineTransition = {
  in: { transform: "translateX(0)" },
  out: { transform: "translateX(-100%)" },
  transitionProperty: "transform, translate",
};

export default function Sidebar({ opened, onOpenedChange, themeVariant = "midnight" }: SidebarProps) {
  // Live mouse drag of the toggle tab, as a fraction of the drawer width (-1..1); null when not dragging.
  const [drag, setDrag] = useState<number | null>(null);
  const dragging = drag !== null;
  const shown = dragging ? (opened ? 1 : 0) + drag : 0; // how much of the drawer is out, 0..1
  const onClose = () => onOpenedChange(false);
  const isDm = useIsDm();
  const isSuperAdmin = useIsSuperAdmin();
  const { pathname } = useLocation();

  // "/" renders Home; "/spells/Fireball" belongs to "/spells"
  const path = pathname === "/" ? "/home" : pathname;
  const activeLink = navSections.flatMap((s) => s.items).find((item) => path.startsWith(item.link))?.link;

  return (
    <>
      <Drawer
        opened={opened || dragging} // mounted while dragging so it can be pulled out with the tab
        onClose={onClose}
        position="left"
        padding={14}
        size="280px" // SidebarToggle's DRAWER_WIDTH rides this edge; phones too, so the page stays visible beside it
        overlayProps={{ color: "#000", backgroundOpacity: 0.5, blur: 4 }}
        withCloseButton={false}
        transitionProps={{ transition: SLIDE, duration: 300, timingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}
        zIndex={198} // just under SidebarToggle (199), which closes it
        // The theme class sits here too: /dashboard renders without one on <html>
        classNames={{
          content: `${classes.drawer} ${getActiveThemeClass(themeVariant)} ${dragging ? classes.dragging : ""}`,
          overlay: dragging ? classes.dragging : undefined,
          body: classes.body,
        }}
        styles={
          dragging
            ? { content: { translate: `${(shown - 1) * 100}%` }, overlay: { "--drag-shown": shown } as CSSProperties }
            : undefined
        }
      >
        <CampaignSwitcher />
        <CharacterCard />

        <nav className={classes.nav} aria-label="Main">
          {navSections
            .filter((section) => (!section.dmOnly || isDm) && (!section.superAdminOnly || isSuperAdmin))
            .map((section) => (
              <NavSection key={section.label ?? "root"} section={section} activeLink={activeLink} onNavigate={onClose} />
            ))}
        </nav>

        <SidebarFooter onNavigate={onClose} />
      </Drawer>
      <SidebarToggle opened={opened} onOpenedChange={onOpenedChange} onDrag={setDrag} />
    </>
  );
}
