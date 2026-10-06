import { ActionIcon, Group, ScrollArea, Stack, Tooltip } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, type Icon } from "@tabler/icons-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { AdminNavItem } from "./AdminNavItem";
import styles from "@styles/AdminDashboard.module.css";

export interface AdminSectionDef {
  /** URL segment: `${basePath}/${path}`. */
  path: string;
  label: string;
  icon: Icon;
  component: ComponentType;
}

/**
 * Full-screen layout shared by the DM dashboard and the superadmin console: the page on the left,
 * section nav on the right. The section lives in the URL (`/dashboard/items`), so links and Back work.
 */
export function AdminShell({
  title,
  basePath,
  sections,
  headerAction,
}: {
  title: string;
  basePath: string;
  sections: AdminSectionDef[];
  /** Under the title, e.g. the campaign switcher. Gets the collapsed state to pick a compact form. */
  headerAction?: (collapsed: boolean) => ReactNode;
}) {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const current = sections.find((s) => s.path === section);
  if (!current) return <Navigate to={`${basePath}/${sections[0].path}`} replace />;
  const Page = current.component;

  const toggle = (
    <Tooltip label={collapsed ? "Expand" : "Collapse"} position="left" withArrow>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand section nav" : "Collapse section nav"}
      >
        {collapsed ? <IconChevronLeft size={16} /> : <IconChevronRight size={16} />}
      </ActionIcon>
    </Tooltip>
  );

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          {collapsed ? (
            <Stack gap={6} align="center">
              {toggle}
              {headerAction?.(true)}
            </Stack>
          ) : (
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <div>
                  <div className={styles.sidebarTitle}>{title}</div>
                  <span className={styles.sidebarStatus}>Link online</span>
                </div>
                {toggle}
              </Group>
              {headerAction?.(false)}
            </Stack>
          )}
        </div>

        <ScrollArea className={styles.sidebarScroll} offsetScrollbars>
          <Stack gap={2} component="nav" aria-label={title} className={styles.navList}>
            {sections.map((s) => (
              <AdminNavItem
                key={s.path}
                icon={s.icon}
                label={s.label}
                isSelected={s === current}
                collapsed={collapsed}
                onClick={() => navigate(`${basePath}/${s.path}`)}
              />
            ))}
          </Stack>
        </ScrollArea>
      </aside>

      <main className={styles.main}>
        <Page />
      </main>
    </div>
  );
}
