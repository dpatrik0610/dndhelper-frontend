import { Tooltip } from "@mantine/core";
import { useSignalRConnection } from "@signalr/hooks/useSignalRConnection";
import { useUsername } from "@store/auth/authSelectors";
import classes from "./ServerStatusDot.module.css";

/** Barely-there server connection dot; details on hover. */
export function ServerStatusDot() {
  const { isConnected, connectionId } = useSignalRConnection();
  const username = useUsername();
  const status = isConnected ? `Connected · ${connectionId?.slice(0, 8)}…` : "Offline: live updates paused";

  return (
    <Tooltip label={username ? `${username} · ${status}` : status} withArrow>
      <span className={classes.hitArea} role="status" aria-label={isConnected ? "Server connected" : "Server offline"}>
        <span className={classes.dot} data-online={isConnected || undefined} />
      </span>
    </Tooltip>
  );
}
