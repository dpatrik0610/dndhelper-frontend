import { useEffect, useState } from "react";
import { Badge, Button, Group, Loader, Paper, Table, Text } from "@mantine/core";
import { IconDoorEnter, IconWorld } from "@tabler/icons-react";
import { getAllCampaignsOverview } from "@services/campaignService";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import type { CampaignSummary } from "@appTypes/Campaign";

/**
 * Superadmin overview of every campaign on the site. Opening one makes it current
 * ("visiting") without joining it; the sidebar switcher otherwise lists only your own campaigns.
 */
export function AllCampaigns() {
  const [rows, setRows] = useState<CampaignSummary[] | null>(null);
  const selectedId = useCampaignStore((s) => s.selectedId);
  const visit = useCampaignStore((s) => s.visit);

  useEffect(() => {
    getAllCampaignsOverview()
      .then(setRows)
      .catch((err) => {
        setRows([]);
        showNotification({ title: "Couldn't load campaigns", message: (err as Error).message, color: SectionColor.Red });
      });
  }, []);

  return (
    <Paper
      p="md"
      radius="md"
      withBorder
      style={{
        background: "linear-gradient(145deg, rgba(0,40,60,0.5), rgba(0,20,40,0.35))",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Group mb="md" gap="xs">
        <IconWorld size={18} color="cyan" />
        <Text fw={600} c="cyan.3">All campaigns</Text>
        {rows && <Text size="sm" c="dimmed">{rows.length} on the site</Text>}
      </Group>

      {!rows ? (
        <Group justify="center" py="xl"><Loader color="cyan" /></Group>
      ) : (
        <Table.ScrollContainer minWidth={640}>
          <Table verticalSpacing="xs" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Campaign</Table.Th>
                <Table.Th>DM</Table.Th>
                <Table.Th ta="right">Members</Table.Th>
                <Table.Th ta="right">Characters</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td>
                    <Group gap={6} wrap="nowrap">
                      <Text fw={600}>{c.name}</Text>
                      {c.amIMember && <Badge size="xs" variant="light" color="teal">yours</Badge>}
                      {!c.isActive && <Badge size="xs" variant="light" color="gray">paused</Badge>}
                    </Group>
                  </Table.Td>
                  <Table.Td>{c.dms.join(", ") || "—"}</Table.Td>
                  <Table.Td ta="right">{c.memberCount}</Table.Td>
                  <Table.Td ta="right">{c.characterCount}</Table.Td>
                  <Table.Td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</Table.Td>
                  <Table.Td ta="right">
                    <Button
                      size="compact-xs"
                      variant="light"
                      leftSection={<IconDoorEnter size={14} />}
                      disabled={c.id === selectedId}
                      onClick={() => void visit(c.id)}
                    >
                      {c.id === selectedId ? "Current" : "Open"}
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </Paper>
  );
}
