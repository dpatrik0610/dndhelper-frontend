import { apiClient } from "@api/apiClient"
import type { AdminUser, AdminUserRequest } from "@appTypes/User"

const BASE_URL = "/user"

/** Superadmin user management. */
export const UserService = {
  // GET: /api/user
  getAll: () => apiClient<AdminUser[]>(BASE_URL, {}),

  // POST: /api/user
  create: (request: AdminUserRequest) => apiClient<AdminUser>(BASE_URL, { method: "POST", body: request }),

  // PATCH: /api/user/{id} (only the sent fields change; a password resets it)
  update: (id: string, request: AdminUserRequest) =>
    apiClient<AdminUser>(`${BASE_URL}/${id}`, { method: "PATCH", body: request }),

  // DELETE: /api/user/{id}
  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`${BASE_URL}/${id}`, { method: "DELETE" })
  },
}
