export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  token?: string
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options
  const API_BASE = import.meta.env.VITE_API_BASE

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    console.log('API Request failed at apiClient.ts.')
    throw new Error(err.message || 'API request failed')
  }

  const text = await res.text()
  if (!text) return null as unknown as T

  try {
    return JSON.parse(text)
  } catch {
    return null as unknown as T
  }
}
