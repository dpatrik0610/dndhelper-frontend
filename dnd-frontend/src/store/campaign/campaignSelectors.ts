import { useCampaignStore } from "./campaignStore";
import { useAuthStore } from "@store/auth/authStore";
import { CampaignRoles } from "@appTypes/Campaign";

export const useCurrentCampaignId = () => useCampaignStore((s) => s.selectedId);
export const useCurrentCampaign = () => useCampaignStore((s) => s.selectedCampaign());

/** My roles in the current campaign (empty when none is selected). */
export const useMyCampaignRoles = (): string[] => {
  const userId = useAuthStore((s) => s.id);
  const campaign = useCurrentCampaign();
  return campaign?.members?.find((m) => m.userId === userId)?.roles ?? EMPTY;
};
const EMPTY: string[] = [];

export const useHasCampaignRole = (role: string) => useMyCampaignRoles().includes(role);

/** DM of the current campaign; the superadmin counts as DM everywhere. */
export const useIsDm = () => {
  const isSuperAdmin = useAuthStore((s) => s.roles.includes("Admin"));
  const isCampaignDm = useHasCampaignRole(CampaignRoles.Dm);
  return isSuperAdmin || isCampaignDm;
};

/**
 * Whether a spell/item/monster/rule can be edited: core content (campaignId null) only by the
 * superadmin, campaign content by that campaign's DM.
 */
export const useCanEditContent = () => {
  const isSuperAdmin = useAuthStore((s) => s.roles.includes("Admin"));
  const isDm = useIsDm();
  return (campaignId: string | null | undefined) => isSuperAdmin || (campaignId != null && isDm);
};
