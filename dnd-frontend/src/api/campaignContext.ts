// The campaign every API call is scoped to (sent as X-Campaign-Id).
// Kept outside the campaign store so apiClient doesn't import a store that imports apiClient.
let currentCampaignId: string | null = null;

export const getCurrentCampaignId = () => currentCampaignId;
export const setCurrentCampaignId = (id: string | null) => {
  currentCampaignId = id;
};
