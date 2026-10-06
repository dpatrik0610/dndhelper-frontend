import { Group } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import type { ReactNode } from "react";
import styles from "@styles/AdminDashboard.module.css";

/** The frame every admin page shares: icon, title, subtitle and actions on top, content below. */
export function AdminPage({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
}: {
  icon: Icon;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <Group gap="sm" wrap="nowrap">
          <div className={styles.pageIcon}>
            <Icon size={20} stroke={1.7} />
          </div>
          <div>
            <h2 className={styles.pageTitle}>{title}</h2>
            {subtitle && <div className={styles.pageSubtitle}>{subtitle}</div>}
          </div>
        </Group>
        {actions && <Group gap="xs">{actions}</Group>}
      </header>
      {children}
    </div>
  );
}

/** A titled section of an admin page. `flush` drops the body padding (tables run edge to edge). */
export function AdminPanel({
  icon: Icon,
  title,
  actions,
  flush,
  children,
}: {
  icon?: Icon;
  title?: ReactNode;
  actions?: ReactNode;
  flush?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      {(title || actions) && (
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            {Icon && <Icon size={16} stroke={1.8} />}
            {title}
          </div>
          {actions && <Group gap="xs">{actions}</Group>}
        </div>
      )}
      <div className={flush ? styles.panelFlush : styles.panelBody}>{children}</div>
    </section>
  );
}

const TONES = {
  default: "",
  accent: styles.toneAccent,
  secondary: styles.toneSecondary,
  tertiary: styles.toneTertiary,
  danger: styles.toneDanger,
  warning: styles.toneWarning,
};

/** A readout tile. `tone` picks the neon: accent (green), secondary (magenta), tertiary (cyan), danger, warning. */
export function AdminStat({ label, value, tone = "default" }: { label: string; value: ReactNode; tone?: keyof typeof TONES }) {
  return (
    <div className={`${styles.stat} ${TONES[tone]}`}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}
