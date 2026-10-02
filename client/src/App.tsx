import { useState } from 'react'
import PriorityBadge from '@/components/PriorityBadge'
import ProjectForm from '@/components/ProjectForm'
import StatusBadge from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from '@/hooks/useProjects'
import type { Project, ProjectInput } from '@/types'

function App() {
  const [editing, setEditing] = useState<Project | 'new' | null>(null)

  const { data: projects = [], isPending, error: loadError } = useProjects()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()

  const error = loadError?.message ?? deleteProject.error?.message

  const handleSave = async (values: ProjectInput) => {
    if (editing && editing !== 'new') {
      await updateProject.mutateAsync({ id: editing.id, input: values })
    } else {
      await createProject.mutateAsync(values)
    }
    setEditing(null)
  }

  const handleDelete = (project: Project) => {
    if (!window.confirm(`Delete "${project.project_name}"? This cannot be undone.`)) return
    deleteProject.mutate(project.id)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Client Project Tracker</h1>
          <Button onClick={() => setEditing('new')}>+ New Project</Button>
        </header>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
        )}

        {isPending ? (
          <p>Loading...</p>
        ) : projects.length === 0 ? (
          <p className="py-10 text-center text-gray-500">
            No projects yet. Click "New Project" to add one.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.project_name}</div>
                      {p.description && (
                        <div className="mt-0.5 max-w-xs text-xs text-gray-500">{p.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.client_name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={p.priority} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{p.start_date}</td>
                    <td className="whitespace-nowrap px-4 py-3">{p.due_date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setEditing(p)}>
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteProject.isPending}
                          onClick={() => handleDelete(p)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editing && (
          <ProjectForm
            project={editing === 'new' ? null : editing}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}
      </div>
    </div>
  )
}

export default App