import { Card, Text } from "@mantine/core";

export default function NoCharacter() {
    return <>
      <Card shadow="sm" radius="md" withBorder p="lg" ta="center">
        <Text c="dimmed">No character available.</Text>
      </Card>
    </>
}