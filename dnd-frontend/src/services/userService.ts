import { apiClient } from "../api/apiClient";

export interface UserDataResponse {
  username: string;
  email: string;
  roles: string[];
  lastLogin: string;
  settings: Record<string, string>;
}

export async function getSelf(): Promise<UserDataResponse> {
  return apiClient<UserDataResponse>("/user/me", {
    method: "GET",
  });
}

export async function getAuthMe(): Promise<UserDataResponse> {
  return apiClient<UserDataResponse>("/Auth/me", {
    method: "GET",
  });
}

export async function getAuthUser(): Promise<UserDataResponse> {
  return apiClient<UserDataResponse>("/Auth/user", {
    method: "GET",
  });
}

export async function getUserById(id: string): Promise<UserDataResponse> {
  return apiClient<UserDataResponse>(`/user/${id}`, {
    method: "GET",
  });
}

export async function getUserSettings(): Promise<Record<string, string>> {
  return apiClient<Record<string, string>>("/user/me/settings", {
    method: "GET",
  });
}

export async function updateUserSettings(settings: Record<string, string>): Promise<Record<string, string>> {
  return apiClient<Record<string, string>>("/user/me/settings", {
    method: "PUT",
    body: settings,
  });
}
