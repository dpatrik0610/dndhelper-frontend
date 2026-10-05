import { useMemo } from "react";
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

/**
 * Campaigns I can run from the dashboard: those where I'm a DM. The superadmin gets all of theirs plus a
 * campaign they're visiting. Campaigns where I'm only a player never show up here.
 */
export const useDmCampaigns = () => {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const visiting = useCampaignStore((s) => s.visiting);
  const userId = useAuthStore((s) => s.id);
  const isSuperAdmin = useAuthStore((s) => s.roles.includes("Admin"));

  return useMemo(() => {
    if (!isSuperAdmin)
      return campaigns.filter((c) => c.members?.some((m) => m.userId === userId && m.roles.includes(CampaignRoles.Dm)));
    return visiting && !campaigns.some((c) => c.id === visiting.id) ? [...campaigns, visiting] : campaigns;
  }, [campaigns, visiting, userId, isSuperAdmin]);
};
