export interface Session {
    id: string;
    campaignId: string;
    ownerIds: string[];
    noteIds: string[];
    encounterIds: string[];
    name: string;
    description: string | null;
    location: string | null;
    scheduledFor: string | null;
    startedAt: string | null;
    endedAt: string | null;
    isLive: boolean;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    isDeleted: boolean;
}

export const sessionTemplate: Session = {
    id: "",
    campaignId: "",
    ownerIds: [],
    noteIds: [],
    encounterIds: [],
    name: "",
    description: null,
    location: null,
    scheduledFor: null,
    startedAt: null,
    endedAt: null,
    isLive: false,
    createdBy: null,
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
    isDeleted: false,
};
