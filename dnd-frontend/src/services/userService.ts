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

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient("/Auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });
}
