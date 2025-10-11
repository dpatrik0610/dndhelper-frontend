import { Paper, Text, Badge } from "@mantine/core";

export interface AbilityScoreProps {
  name: string;
  score: number;
}

export function AbilityScore({ name, score }: AbilityScoreProps) {
  const modifier = Math.floor((score - 10) / 2);
  const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  
  return (
    <Paper p="sm" withBorder style={{ textAlign: 'center' }} bg={"transparent"}>
      <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb="xs">
        {name}
      </Text>
      <Text size="lg" fw={700}>
        {score}
      </Text>
      <Badge size="sm" color="gray" variant="light" mt="xs">
        {modifierStr}
      </Badge>
    </Paper>
  );
}