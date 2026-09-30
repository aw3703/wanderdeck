import { getAuthToken, integration } from 'deepspace'

export interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Call a server action defined in src/actions/index.ts
 */
export async function callAction<T = unknown>(
  actionName: string,
  params: Record<string, unknown> = {}
): Promise<ActionResult<T>> {
  try {
    const token = await getAuthToken()

    const res = await fetch(`/api/actions/${actionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      return { success: false, error: (err as { error?: string }).error || `Error ${res.status}` }
    }

    return (await res.json()) as ActionResult<T>
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
}

/**
 * Direct platform integration call from client
 */
export async function callClientIntegration<T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<{ success: boolean; data?: T; error?: string }> {
  const res = await integration.post<T>(endpoint, data)
  if (res.success) {
    return { success: true, data: res.data }
  } else {
    return { success: false, error: res.error }
  }
}
