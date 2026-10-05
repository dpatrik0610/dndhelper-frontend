export const CampaignRoles = { Dm: "DM", Player: "Player" } as const;

/** Core content types a campaign can import (read-only, shared). */
export const CORE_CONTENT_TYPES = ["Spells", "Equipment", "Monsters", "Rules"] as const;
export type CoreContentType = (typeof CORE_CONTENT_TYPES)[number];

export interface CampaignMember {
    userId: string;
    roles: string[];
}

/** Member row with the username resolved (GET /campaign/{id}/members). */
export interface CampaignMemberView extends CampaignMember {
    username: string;
}

/** Superadmin's all-campaigns overview row (GET /campaign/all). */
export interface CampaignSummary {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string | null;
    dms: string[];
    memberCount: number;
    characterCount: number;
    amIMember: boolean;
}

export interface Campaign {
    id: string;
    name: string;
    description: string | null;
    characterIds: string[];
    members: CampaignMember[];
    inviteCode: string | null;
    coreImports: CoreContentType[];
    /** Mirror of the DM members, kept by the server. */
    ownerIds: string[] | null;
    activeEncounterId: string | null;
    worldIds: string[];
    questIds: string[];
    noteIds: string[];
    createdAt: string | null;
    updatedAt: string | null;
    isDeleted: boolean;
    isActive: boolean;
    currentSessionId: string | null;
    sessionIds: string[];
}
