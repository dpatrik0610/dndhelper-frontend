import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Group, Loader, Table, Text } from "@mantine/core";
import { IconDoorEnter, IconWorld } from "@tabler/icons-react";
import { getAllCampaignsOverview } from "@services/campaignService";
import { useCampaignStore } from "@store/campaign/campaignStore";
import { showNotification } from "@components/Notification/Notification";
import { SectionColor } from "@appTypes/SectionColor";
import type { CampaignSummary } from "@appTypes/Campaign";
import { AdminPage, AdminPanel } from "@features/admin/components/AdminPage";

/**
 * Superadmin overview of every campaign on the site. Opening one makes it current
 * ("visiting") without joining it and goes to the DM dashboard; the sidebar switcher otherwise lists only your own campaigns.
 */
export function AllCampaigns() {
  const [rows, setRows] = useState<CampaignSummary[] | null>(null);
  const selectedId = useCampaignStore((s) => s.selectedId);
  const visit = useCampaignStore((s) => s.visit);
  const navigate = useNavigate();

  useEffect(() => {
    getAllCampaignsOverview()
      .then(setRows)
      .catch((err) => {
        setRows([]);
        showNotification({ title: "Couldn't load campaigns", message: (err as Error).message, color: SectionColor.Red });
      });
  }, []);

  const open = async (id: string) => {
    await visit(id);
    if (useCampaignStore.getState().selectedId === id) navigate("/dashboard/campaigns");
  };

  return (
    <AdminPage
      icon={IconWorld}
      title="All Campaigns"
      subtitle={rows ? `${rows.length} on the site` : "Every campaign on the site"}
    >
      <AdminPanel flush>
        {!rows ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
          </Group>
        ) : rows.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl" size="sm">
            No campaigns.
          </Text>
        ) : (
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
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
                        <Text fw={600} size="sm">{c.name}</Text>
                        {c.amIMember && <Badge size="xs" variant="light" color="neon">yours</Badge>}
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
                        color="neon"
                        leftSection={<IconDoorEnter size={14} />}
                        onClick={() => void open(c.id)}
                      >
                        {c.id === selectedId ? "Manage" : "Open"}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </AdminPanel>
    </AdminPage>
  );
}
