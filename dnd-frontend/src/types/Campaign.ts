export interface Campaign {
    id: string;
    name: string;
    description: string | null;
    characterIds: string[];
    ownerIds: string[] | null;
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