export const STATUSES = ['Planning', 'In Progress', 'On Hold', 'Completed'] as const
export const PRIORITIES = ['Low', 'Medium', 'High'] as const

export type Status = (typeof STATUSES)[number]
export type Priority = (typeof PRIORITIES)[number]

export type ProjectInput = {
  client_name: string
  project_name: string
  description: string
  status: Status
  priority: Priority
  start_date: string
  due_date: string
}

export type Project = Omit<ProjectInput, 'description'> & {
  id: number
  description: string | null
}