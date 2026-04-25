import { Anchor, Badge, Box, Card, Image, SimpleGrid, Stack, Table, Text } from "@mantine/core";
import { IconMap2, IconPackage, IconSparkles, IconUsersGroup } from "@tabler/icons-react";
import { MarkdownRenderer } from "@components/MarkdownRender";
import type { Encounter } from "@appTypes/Encounter";
import type { Session } from "@appTypes/Session";
import { sortEntities } from "../encounterUtils";
import { EncounterSection } from "./EncounterSection";

type ReadOnlyEncounterStateProps = {
  encounter: Encounter;
  activeSession: Session | null;
  isActiveEncounter: boolean;
};

export function ReadOnlyEncounterState({
  encounter,
  activeSession,
  isActiveEncounter,
}: ReadOnlyEncounterStateProps) {
  const entities = sortEntities(encounter.entities);

  return (
    <Stack gap="lg">
      <EncounterSection
        title="Encounter Details"
        description="Shared encounter information for the campaign."
        icon={<IconSparkles size={18} />}
      >
        <SimpleGrid cols={{ base: 1, md: 4 }}>
          <Card radius="md" p="md" bg="rgba(255,255,255,0.02)">
            <Text size="xs" tt="uppercase" c="dimmed">
              Status
            </Text>
            <Badge mt="xs" size="lg" color={encounter.status === "Active" ? "green" : "grape"}>
              {encounter.status}
            </Badge>
          </Card>
          <Card radius="md" p="md" bg="rgba(255,255,255,0.02)">
            <Text size="xs" tt="uppercase" c="dimmed">
              Location
            </Text>
            <Text mt="xs">{encounter.location || "Unknown"}</Text>
          </Card>
          <Card radius="md" p="md" bg="rgba(255,255,255,0.02)">
            <Text size="xs" tt="uppercase" c="dimmed">
              Session
            </Text>
            <Text mt="xs">{activeSession?.name || "Standalone encounter"}</Text>
          </Card>
          <Card radius="md" p="md" bg="rgba(255,255,255,0.02)">
            <Text size="xs" tt="uppercase" c="dimmed">
              Visibility
            </Text>
            <Text mt="xs">{isActiveEncounter ? "Live for players" : "Waiting for activation"}</Text>
          </Card>
        </SimpleGrid>

        <Box>
          <Text size="sm" fw={600} mb="xs">
            Description
          </Text>
          {encounter.description ? (
            <MarkdownRenderer content={encounter.description} />
          ) : (
            <Text c="dimmed">No description provided.</Text>
          )}
        </Box>
      </EncounterSection>

      <EncounterSection
        title="Map and Gallery"
        description="Main battle map plus any supporting reference images."
        icon={<IconMap2 size={18} />}
      >
        <Stack gap="md">
          {encounter.mapUrl ? (
            <Stack gap="xs">
              <Image src={encounter.mapUrl} radius="md" alt={`${encounter.name} map`} mah={420} fit="contain" />
              <Anchor href={encounter.mapUrl} target="_blank" rel="noreferrer" size="sm">
                Open map source
              </Anchor>
            </Stack>
          ) : (
            <Text c="dimmed">No battle map attached.</Text>
          )}

          {encounter.imageUrls.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }}>
              {encounter.imageUrls.map((url) => (
                <Image key={url} src={url} radius="md" alt="Encounter reference" mah={220} fit="cover" />
              ))}
            </SimpleGrid>
          ) : (
            <Text c="dimmed">No extra encounter images.</Text>
          )}
        </Stack>
      </EncounterSection>

      <EncounterSection
        title="Entities"
        description="All creatures and participants in the encounter."
        icon={<IconUsersGroup size={18} />}
      >
        {entities.length > 0 ? (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Initiative</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Note</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entities.map((entity, index) => (
                <Table.Tr key={`${entity.name}-${index}`}>
                  <Table.Td>{entity.name}</Table.Td>
                  <Table.Td>{entity.type}</Table.Td>
                  <Table.Td>{entity.initiative ?? "-"}</Table.Td>
                  <Table.Td>{entity.quantity}</Table.Td>
                  <Table.Td>{entity.status}</Table.Td>
                  <Table.Td>{entity.note || "-"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed">No entities added yet.</Text>
        )}
      </EncounterSection>

      <EncounterSection
        title="Loot"
        description="Encounter rewards, drops, and claim tracking."
        icon={<IconPackage size={18} />}
      >
        {encounter.loot.length > 0 ? (
          <Stack gap="sm">
            {encounter.loot.map((item, index) => (
              <Card key={`${item.name}-${index}`} radius="md" p="md" bg="rgba(255,255,255,0.02)">
                <Box>
                  <Text fw={600}>
                    {item.name} x{item.quantity}
                  </Text>
                  {item.note ? (
                    <Text size="sm" c="dimmed">
                      {item.note}
                    </Text>
                  ) : null}
                </Box>
                <Badge color={item.isClaimed ? "teal" : "gray"} mt="sm">
                  {item.isClaimed ? "Claimed" : "Available"}
                </Badge>
              </Card>
            ))}
          </Stack>
        ) : (
          <Text c="dimmed">No loot has been added.</Text>
        )}
      </EncounterSection>
    </Stack>
  );
}
