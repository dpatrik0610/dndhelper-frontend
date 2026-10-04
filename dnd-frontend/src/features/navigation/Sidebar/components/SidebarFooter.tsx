import { Tooltip } from "@mantine/core";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import { handleLogout } from "@utils/handleLogout";
import { ThemeBubble } from "./ThemeBubble";
import { ServerStatusDot } from "./ServerStatusDot";
import classes from "./SidebarFooter.module.css";

interface SidebarFooterProps {
  onNavigate: () => void;
}

/** Theme bubble on the left; status, settings and logout on the right (hidden while the bubble is open). */
export function SidebarFooter({ onNavigate }: SidebarFooterProps) {
  const navigate = useNavigate();
  const onSettings = useLocation().pathname.startsWith("/settings");

  return (
    <footer className={classes.footer}>
      <ThemeBubble />

      <div className={classes.actions}>
        <ServerStatusDot />

        <Tooltip label="Settings" withArrow>
          <Link
            to="/settings"
            onClick={onNavigate}
            className={classes.action}
            aria-label="Settings"
            aria-current={onSettings ? "page" : undefined}
          >
            <IconSettings size={18} stroke={1.7} />
          </Link>
        </Tooltip>

        <Tooltip label="Log out" withArrow>
          <button
            type="button"
            className={`${classes.action} ${classes.logout}`}
            aria-label="Log out"
            onClick={() => {
              handleLogout();
              onNavigate();
              navigate("/login");
            }}
          >
            <IconLogout size={18} stroke={1.7} />
          </button>
        </Tooltip>
      </div>
    </footer>
  );
}
