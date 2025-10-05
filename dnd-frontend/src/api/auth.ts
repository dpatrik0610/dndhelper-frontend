import type { LoginRequest, LoginResponse } from '../types/auth'
import { apiClient } from './apiClient'

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/Auth/login', {
    method: 'POST',
    body: data,
  })
}
