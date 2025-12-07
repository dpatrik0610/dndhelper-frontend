import type { CSSProperties } from "react";
import { Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";

interface ComingSoonCardProps {
  paletteTextDim: string;
  cardStyle: CSSProperties;
}

export function ComingSoonCard({ paletteTextDim, cardStyle }: ComingSoonCardProps) {
  return (
    <Paper withBorder radius="md" p="md" shadow="sm" style={cardStyle}>
      <Group gap="xs" mb="xs">
        <ThemeIcon color="blue" variant="light">
          <IconSparkles size={18} />
        </ThemeIcon>
        <Text fw={700} size="sm">
          Coming soon
        </Text>
      </Group>
      <Text size="sm" c={paletteTextDim} mt="xs">
        Jelenleg még csak demo adatok futnak. Terv: bekötjük a rules API-t, a keresés/szűrés marad, a drawer élő adatot húz.
        Ha megvan az endpoint, csak ki lesz cserélve a service és a layout kb így marad.
      </Text>
    </Paper>
  );
}
