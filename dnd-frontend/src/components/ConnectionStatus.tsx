import { Group, Text, Tooltip } from "@mantine/core";
import CustomBadge from "./common/CustomBadge";
import { useSignalRConnection } from "../SignalR/hooks/useSignalRConnection";

export function ConnectionStatus () {
  const { connection, isConnected, connectionId } = useSignalRConnection();

    return <>
    <Group>
        <Text c={"dimmed"} size="sm">Server Status: </Text>
        <Tooltip 
        label={isConnected ? `Connected to the server. ID: ${connectionId?.slice(0, 8)}...` : "Disconnected from server"}
        withArrow
        >
        <CustomBadge variant="dot" color={isConnected? "green": "red"}  label={isConnected? "LIVE" : "Offline"} bg={"transparent"}/>
        </Tooltip>
    </Group>
    </>
}