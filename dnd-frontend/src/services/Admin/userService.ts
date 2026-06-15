import { apiClient } from "../../api/apiClient"
import type { User, UserStatus } from "../../types/User"

const BASE_URL = "/user"

export const UserService = {
  // GET: /api/user
  getAll: async (): Promise<User[]> => {
    return apiClient<User[]>(BASE_URL, {})
  },

  // GET: /api/user/{id}
  getById: async (id: string): Promise<User> => {
    return apiClient<User>(`${BASE_URL}/${id}`, {})
  },

  // PUT: /api/user/{id}
  update: async (id: string, user: User): Promise<User> => {
    return apiClient<User>(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: user,

    })
  },

  // PATCH: /api/user/{id}/status?status=Active
  updateStatus: async (
    id: string,
    status: UserStatus
  ): Promise<User> => {
    return apiClient<User>(`${BASE_URL}/${id}/status?status=${status}`, {
      method: "PATCH",

    })
  },

  // DELETE: /api/user/{id}
  delete: async (id: string): Promise<void> => {
    await apiClient<void>(`${BASE_URL}/${id}`, { method: "DELETE" })
  },
}
