import type { Project, ProjectInput } from '@/types'

const BASE = '/api/projects'

export class ValidationError extends Error {
  errors: Record<string, string[]>

  constructor(message: string, errors: Record<string, string[]>) {
    super(message)
    this.errors = errors
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => null)

  if (res.status === 422) throw new ValidationError(data.message, data.errors)
  if (!res.ok) throw new Error(data?.message ?? 'Something went wrong.')

  return data as T
}

export const api = {
  list: () => request<Project[]>(BASE),
  create: (input: ProjectInput) =>
    request<Project>(BASE, { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: ProjectInput) =>
    request<Project>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}