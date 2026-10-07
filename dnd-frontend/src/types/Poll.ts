export type PollResultsVisibility = "Always" | "AfterVote" | "AfterClose";

export interface PollOption {
  id: string;
  text: string;
  /** Username of the player who suggested it; null for the DM's own options. */
  suggestedBy?: string | null;
}

export interface PollVoter {
  username: string;
  optionIds: string[];
  votedAt: string;
}

/** One user's view of a poll: the server strips hidden results and anonymous voters. */
export interface Poll {
  id: string;
  campaignId: string;
  title: string;
  description?: string | null;
  options: PollOption[];
  allowMultiple: boolean;
  maxChoices?: number | null;
  anonymous: boolean;
  resultsVisibility: PollResultsVisibility;
  allowVoteChange: boolean;
  allowSuggestions: boolean;
  announceOnClose: boolean;
  closesAt?: string | null;
  isClosed: boolean;
  closedAt?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  myOptionIds: string[];
  voterCount: number;
  memberCount: number;
  resultsHidden: boolean;
  /** Votes per option id; null while results are hidden. */
  tally: Record<string, number> | null;
  /** Who voted for what; null when anonymous or hidden. */
  voters: PollVoter[] | null;
}

export interface PollInput {
  campaignId?: string;
  title: string;
  description?: string | null;
  /** Existing options keep their id (and their votes). */
  options: { id?: string; text: string }[];
  allowMultiple: boolean;
  maxChoices?: number | null;
  anonymous: boolean;
  resultsVisibility: PollResultsVisibility;
  allowVoteChange: boolean;
  allowSuggestions: boolean;
  announceOnClose: boolean;
  closesAt?: string | null;
}

/** Open until the DM closes it or its deadline passes (the server closes it on the next read). */
export const isPollOpen = (poll: Poll, now = Date.now()) =>
  !poll.isClosed && (!poll.closesAt || new Date(poll.closesAt).getTime() > now);
