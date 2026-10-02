import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { ValidationError } from '@/api/projects'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PRIORITIES, STATUSES } from '@/constants'
import { projectSchema } from '@/schemas/project'
import type { Project, ProjectInput } from '@/types'

type Props = {
  project: Project | null
  onSave: (values: ProjectInput) => Promise<void>
  onCancel: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

export default function ProjectForm({ project, onSave, onCancel }: Props) {
  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_name: project?.client_name ?? '',
      project_name: project?.project_name ?? '',
      description: project?.description ?? '',
      status: project?.status ?? 'Planning',
      priority: project?.priority ?? 'Medium',
      start_date: project?.start_date ?? today(),
      due_date: project?.due_date ?? today(),
    },
  })

  const { control, handleSubmit, setError, formState } = form
  const { isSubmitting, errors } = formState

  const onSubmit = async (values: ProjectInput) => {
    try {
      await onSave(values)
    } catch (err) {
      if (err instanceof ValidationError) {
        // Show Laravel's 422 errors under the matching fields
        for (const [field, messages] of Object.entries(err.errors)) {
          setError(field as keyof ProjectInput, { type: 'server', message: messages[0] })
        }
      } else {
        setError('root.server', {
          message: err instanceof Error ? err.message : 'Something went wrong.',
        })
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-background p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold">{project ? 'Edit Project' : 'New Project'}</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {errors.root?.server && (
              <p className="text-sm text-destructive">{errors.root.server.message}</p>
            )}

            <Controller
              name="client_name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="client_name">Client Name</FieldLabel>
                  <Input {...field} id="client_name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="project_name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project_name">Project Name</FieldLabel>
                  <Input {...field} id="project_name" aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    rows={3}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="status"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="status"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="priority"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="priority">Priority</FieldLabel>
                    <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="priority"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select a priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                name="start_date"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
                    <Input
                      {...field}
                      id="start_date"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="due_date"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="due_date">Due Date</FieldLabel>
                    <Input
                      {...field}
                      id="due_date"
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {project ? 'Updating...' : 'Creating...'}
                  </>
                ) : project ? (
                  'Update'
                ) : (
                  'Add Project'
                )}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}