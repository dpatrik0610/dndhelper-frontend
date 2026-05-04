import { Avatar, Group, Tooltip } from "@mantine/core";

interface PlayerAvatarRowProps {
  playerIds: string[];
}

export function PlayerAvatarRow({ playerIds }: PlayerAvatarRowProps) {
  return (
    <Avatar.Group spacing="sm">
      {playerIds.slice(0, 6).map((id) => (
        <Tooltip key={id} label={id}>
          <Avatar size="sm" radius="xl" color="violet">
            {id.slice(0, 2).toUpperCase()}
          </Avatar>
        </Tooltip>
      ))}
      {playerIds.length > 6 && (
        <Avatar size="sm" radius="xl">
          +{playerIds.length - 6}
        </Avatar>
      )}
      {playerIds.length === 0 && <Group h={28} />}
    </Avatar.Group>
  );
}
