import type { NavSectionData } from "@features/navigation/Sidebar/navItems";
import { NavItem } from "./NavItem";
import classes from "./NavSection.module.css";

interface NavSectionProps {
  section: NavSectionData;
  activeLink?: string;
  onNavigate: () => void;
}

export function NavSection({ section, activeLink, onNavigate }: NavSectionProps) {
  return (
    <section className={classes.section}>
      {section.label && <h3 className={classes.label}>{section.label}</h3>}
      {section.items.map((item) => (
        <NavItem key={item.link} item={item} active={item.link === activeLink} onNavigate={onNavigate} />
      ))}
    </section>
  );
}
