import { apiClient } from "../../api/apiClient"
import type { User, UserStatus } from "../../types/User"

const BASE_URL = "/user"
export const UserService = {
  // GET: /api/user
  getAll: async (token?: string): Promise<User[]> => {
    return apiClient<User[]>(BASE_URL, { token })
  },

  // GET: /api/user/{id}
  getById: async (id: string, token?: string): Promise<User> => {
    return apiClient<User>(`${BASE_URL}/${id}`, { token })
  },

  // PUT: /api/user/{id}
  update: async (id: string, user: User, token?: string): Promise<User> => {
    return apiClient<User>(`${BASE_URL}/${id}`, {
      method: "PUT",
      body: user,
      token,
    })
  },

  // PATCH: /api/user/{id}/status?status=Active
  updateStatus: async (
    id: string,
    status: UserStatus,
    token?: string
  ): Promise<User> => {
    return apiClient<User>(`${BASE_URL}/${id}/status?status=${status}`, {
      method: "PATCH",
      token,
    })
  },

  // DELETE: /api/user/{id}
  delete: async (id: string, token?: string): Promise<void> => {
    await apiClient<void>(`${BASE_URL}/${id}`, { method: "DELETE", token })
  },
}
