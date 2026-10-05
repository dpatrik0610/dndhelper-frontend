import { ActionIcon, Tooltip } from "@mantine/core";
import { IconLock, IconWorldUpload } from "@tabler/icons-react";
import CustomBadge from "./CustomBadge";
import { SectionColor } from "@appTypes/SectionColor";
import { useIsSuperAdmin } from "@store/auth/authSelectors";
import { promoteToCore } from "@services/campaignService";
import { showNotification } from "@components/Notification/Notification";
import type { CoreContentType } from "@appTypes/Campaign";

/** "Core" marker for shared, read-only content (campaignId null). Renders nothing for campaign content. */
export function CoreBadge({ campaignId, size = "sm" }: { campaignId: string | null | undefined; size?: string }) {
  if (campaignId !== null) return null;
  return (
    <CustomBadge
      label="Core"
      icon={<IconLock size={12} />}
      color={SectionColor.Blue}
      variant="light"
      size={size}
      hoverText="Shared core content: read-only, edited only by the superadmin."
    />
  );
}

/** Superadmin-only button that moves a campaign's spell/item/monster/rule into core. */
export function PromoteToCoreButton({
  type,
  id,
  campaignId,
  onPromoted,
}: {
  type: CoreContentType;
  id: string | undefined;
  campaignId: string | null | undefined;
  onPromoted?: () => void;
}) {
  const isSuperAdmin = useIsSuperAdmin();
  if (!isSuperAdmin || !id || campaignId == null) return null;

  const promote = async () => {
    try {
      await promoteToCore(type, id);
      showNotification({ title: "Moved to core", message: "Every campaign that imports it can now read it.", color: SectionColor.Green });
      onPromoted?.();
    } catch (err) {
      showNotification({ title: "Couldn't promote", message: (err as Error).message, color: SectionColor.Red });
    }
  };

  return (
    <Tooltip label="Promote to core (shared, read-only)" withArrow>
      <ActionIcon variant="subtle" color="blue" onClick={promote} aria-label="Promote to core">
        <IconWorldUpload size={18} />
      </ActionIcon>
    </Tooltip>
  );
}
