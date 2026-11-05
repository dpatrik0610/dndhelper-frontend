export type SessionStatus = "Planned" | "Live" | "Completed";

export interface SessionNote {
  id: string;
  content: string;
  dmOnly: boolean;
  author: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Session {
  id: string;
  campaignId: string;
  number: number;
  name: string;
  location: string | null;
  status: SessionStatus;
  scheduledFor: string | null;
  startedAt: string | null;
  endedAt: string | null;
  plan: string | null;
  recap: string | null;
  notes: SessionNote[];
  encounterIds: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export type SessionDetails = Pick<Session, "name" | "number" | "location" | "scheduledFor" | "plan" | "recap">;

export interface SessionNoteInput {
  content: string;
  dmOnly: boolean;
}
