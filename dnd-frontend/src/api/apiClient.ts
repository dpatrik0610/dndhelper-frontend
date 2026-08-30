import { getAuthTokenSafe } from "@store/auth/authUtils"

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  token?: string
}

const API_BASE = import.meta.env.VITE_API_BASE
export async function apiClient<T>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, token: explicitToken } = options
  const token = explicitToken ?? getAuthTokenSafe();
  const headers: Record<string, string> = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    console.log('API Request failed at apiClient.ts.')
    const error = new Error(err.message || 'API request failed')
    ;(error as Error & { status?: number }).status = res.status
    throw error
  }

  if (res.status === 204) {
    return null as T;
  }

  const text = await res.text()
  if (!text) return null as unknown as T

  try {
    return JSON.parse(text)
  } catch {
    return null as unknown as T
  }
}
