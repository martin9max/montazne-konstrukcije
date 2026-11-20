export class ApiError extends Error {}

export async function postJSON<T>(url: string, body: unknown, timeoutMs = 30000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    let data: unknown = null
    try {
      data = await res.json()
    } catch {
      /* odgovor nije JSON */
    }
    if (!res.ok) {
      const msg = (data as { error?: string } | null)?.error
      throw new ApiError(msg || `Greška ${res.status}`)
    }
    return data as T
  } catch (e) {
    if (e instanceof ApiError) throw e
    throw new ApiError('Nema veze sa serverom.')
  } finally {
    clearTimeout(timer)
  }
}
