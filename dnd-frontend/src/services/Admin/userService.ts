import { apiClient } from "@api/apiClient"
import type { AdminUser, AdminUserRequest } from "@appTypes/User"

const BASE_URL = "/user"

/** Superadmin user management. */
export const UserService = {
  getAll: () => apiClient<AdminUser[]>(BASE_URL, {}),

  create: (request: AdminUserRequest) => apiClient<AdminUser>(BASE_URL, { method: "POST", body: request }),

  // PATCH: /api/user/{id} (only the sent fields change; a password resets it)
  update: (id: string, request: AdminUserRequest) =>
    apiClient<AdminUser>(`${BASE_URL}/${id}`, { method: "PATCH", body: request }),

  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`${BASE_URL}/${id}`, { method: "DELETE" })
  },
}
