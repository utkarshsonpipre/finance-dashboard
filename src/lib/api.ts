// src/lib/api.ts
// Typed fetch wrapper for calling the API from the frontend

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

// Token is now passed from the caller (which gets it from Clerk's useAuth)
async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const json: ApiResponse<T> = await res.json()
  return json
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>(path, {}, token),
  post: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token),
  patch: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token),
  delete: <T>(path: string, token?: string | null) => request<T>(path, { method: 'DELETE' }, token),
}

// ─── Auth helpers ────────────────────────────────────────────────────

export interface UserInfo {
  id: string
  name: string
  email: string
  role: 'viewer' | 'analyst' | 'admin'
  status: string
  roleSelected?: boolean
}

// Removed deprecated local session helpers
