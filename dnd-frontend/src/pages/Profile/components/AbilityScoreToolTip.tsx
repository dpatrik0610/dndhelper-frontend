import { Card, Text, Stack } from "@mantine/core";

interface AbilityScoreTooltipProps {
  active?: boolean;
  payload?: any[];
}

export default function AbilityScoreTooltip({ active, payload }: AbilityScoreTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const { ability, score } = payload[0].payload;

  return (
    <Card
      shadow="xl"
      radius="sm"
      p="xs"
      style={{
        background: 'linear-gradient(135deg, rgba(0,255,255,0.2), rgba(0,128,128,0.4))',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <Stack>
        <Text fw={700} ta={'center'}>{ability}</Text>
        <Text size="xl" ta={'center'}> Score: {score}</Text>
      </Stack>
    </Card>
  );
}
