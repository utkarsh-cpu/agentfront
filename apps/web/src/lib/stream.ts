import { useAuthStore } from '@/stores/auth.store'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function streamSSE(
  url: string,
  body: unknown,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const token = useAuthStore.getState().token

  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    signal,
    credentials: 'include',
  })

  if (!response.ok || !response.body) {
    throw new Error(`Stream failed: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    const lines = text.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim()
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          const content = parsed?.choices?.[0]?.delta?.content ?? parsed?.delta ?? ''
          if (content) onChunk(content)
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}
