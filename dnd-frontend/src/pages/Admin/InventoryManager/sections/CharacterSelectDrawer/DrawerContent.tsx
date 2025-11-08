import { ScrollArea, SimpleGrid, Group, Loader, Text } from "@mantine/core";
import { useAdminCharacterStore } from "../../../../../store/admin/useAdminCharacterStore";
import { CharacterCard } from "./CharacterCard";

export function DrawerContent() {
  const { characters, selectedId, loading } = useAdminCharacterStore();

  if (loading)
    return (
      <Group justify="center" mt="xl">
        <Loader color="grape" size="lg" />
      </Group>
    );

  if (!characters?.length)
    return (
      <Text c="dimmed" ta="center" mt="lg">
        No characters found for this campaign.
      </Text>
    );

  return (
    <ScrollArea style={{ flex: 1 }}>
      <SimpleGrid cols={1} verticalSpacing="md" mt="md">
        {characters.map((ch) => (
          <CharacterCard
            key={ch.id}
            id={ch.id!}
            name={ch.name}
            ownerId={ch.ownerId}
            isSelected={selectedId === ch.id}
          />
        ))}
      </SimpleGrid>
    </ScrollArea>
  );
}
