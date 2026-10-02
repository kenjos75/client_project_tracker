import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/projects'
import type { ProjectInput } from '@/types'

const projectsKey = ['projects'] as const

export function useProjects() {
  return useQuery({ queryKey: projectsKey, queryFn: api.list })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectInput) => api.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsKey }),
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProjectInput }) => api.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsKey }),
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsKey }),
  })
}