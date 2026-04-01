export type CampaignCharacterDto = {
  id?: string | null;
  name?: string | null;
  isDead?: boolean | null;
  isNPC?: boolean | null;
};

export type CampaignOverviewDto = {
  id: string;
  name: string;
  description?: string | null;
  characters: CampaignCharacterDto[];
  ownerIds?: string[] | null;
  currentSessionId?: string | null;
  questIds: string[];
};
