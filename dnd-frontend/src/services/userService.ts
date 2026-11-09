import { apiClient } from "@api/apiClient";

export interface UserDataResponse {
  username: string;
  email: string;
  roles: string[];
  lastLogin: string;
  dateCreated: string;
  settings: Record<string, string>;
}

export async function getSelf(): Promise<UserDataResponse> {
  return apiClient<UserDataResponse>("/user/me", {
    method: "GET",
  });
}

export async function updateUserSettings(settings: Record<string, string>): Promise<Record<string, string>> {
  return apiClient<Record<string, string>>("/user/me/settings", {
    method: "PUT",
    body: settings,
  });
}

/** Critter name → how many times it has been caught. */
export type CritterCounts = Record<string, number>;

export interface CritterScore {
  username: string;
  total: number;
  caught: CritterCounts;
}

/** Claims the server's current critter spawn: the new score row if this user was first, null if it was already gone. */
export const catchCritter = (name: string, spawnId: string) =>
  apiClient<CritterScore | null>(`/user/me/critters/${encodeURIComponent(name)}?spawn=${encodeURIComponent(spawnId)}`, {
    method: "POST",
  });

/** Everyone's catches, most first (the hidden /scoreboard page). */
export const getCritterScoreboard = () => apiClient<CritterScore[]>("/user/critters/scoreboard");

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient("/Auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}
