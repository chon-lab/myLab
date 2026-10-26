import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast } from '@/lib/api-error-toasts'
import { projectStatusLabels } from '@/pages/projects/project-format'
import {
  projectsKeys,
  useCreateProjectMutation,
  useProjectQuery,
  useUpdateProjectMutation,
} from '@/queries/projects/projects.queries'
import type { Laboratory } from '@/types/laboratories/laboratory.types'
import {
  projectFormSchema,
  projectStatusValues,
  toCreateProjectPayload,
  toProjectFormFieldPath,
  toProjectFormValues,
  toUpdateProjectPayload,
  type ProjectFormValues,
} from '@/types/projects/project.schema'
import type { Project, ProjectStatus } from '@/types/projects/project.types'
import type { ResearchLine } from '@/types/research-lines/research-line.types'

export type ProjectDialogState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; project: Project }

type FormMode = 'create' | 'edit'

function getSaveErrorMessage(error: unknown, mode: FormMode) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return mode === 'create'
        ? 'O laboratório ou a linha de pesquisa não foi encontrado. Atualize a página e tente novamente.'
        : 'Este projeto não foi encontrado. Ele pode ter sido removido.'
    }
    if (error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
      return 'Revise os campos destacados e tente novamente.'
    }
    if (error.status === 400) {
      return 'O servidor recusou os dados informados. Revise os campos e tente novamente.'
    }
  }
  return mode === 'create'
    ? 'Não foi possível criar o projeto. Tente novamente.'
    : 'Não foi possível salvar as alterações. Tente novamente.'
}

function ProjectFormContent({
  mode,
  initialProject,
  laboratories,
  researchLines,
  onSaved,
}: {
  mode: FormMode
  initialProject?: Project
  laboratories: Laboratory[]
  researchLines: ResearchLine[]
  onSaved: (mode: FormMode) => void
}) {
  const queryClient = useQueryClient()
  const detailQuery = useProjectQuery(mode === 'edit' && initialProject ? initialProject.id : null, initialProject)
  const effectiveProject = mode === 'edit' ? (detailQuery.data ?? initialProject) : undefined

  const {
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: toProjectFormValues(effectiveProject),
  })

  const createProject = useCreateProjectMutation()
  const updateProject = useUpdateProjectMutation()
  const isSubmitting = createProject.isPending || updateProject.isPending
  const [formError, setFormError] = useState<string | null>(null)
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (detailQuery.isError) publishApiErrorToast(detailQuery.error)
  }, [detailQuery.error, detailQuery.isError])

  useEffect(() => {
    setFocus('name')
  }, [setFocus])

  useEffect(() => {
    if (isEdit && detailQuery.data && !isDirty) reset(toProjectFormValues(detailQuery.data))
  }, [detailQuery.data, isDirty, isEdit, reset])

  if (isEdit && detailQuery.isError) {
    const isNotFound = detailQuery.error instanceof ApiError && detailQuery.error.status === 404

    return (
      <div className="space-y-4 px-6 py-6">
        <p role="alert" className="text-sm text-destructive">
          {isNotFound
            ? 'Este projeto não foi encontrado. Ele pode ter sido removido.'
            : 'Não foi possível carregar os dados atualizados deste projeto.'}
        </p>
        <DialogFooter className="mx-0 mb-0 px-0 py-0">
          {!isNotFound && (
            <Button type="button" variant="outline" onClick={() => void detailQuery.refetch()}>
              Tentar novamente
            </Button>
          )}
          <DialogClose asChild>
            <Button
              type="button"
              onClick={() => {
                if (isNotFound) void queryClient.invalidateQueries({ queryKey: projectsKeys.all })
              }}
            >
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </div>
    )
  }

  function handleMutationError(error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 404) void queryClient.invalidateQueries({ queryKey: projectsKeys.all })
      Object.entries(error.fieldErrors).forEach(([apiField, message]) => {
        setError(toProjectFormFieldPath(apiField), { type: 'server', message })
      })
    }
    setFormError(getSaveErrorMessage(error, mode))
  }

  function submit(values: ProjectFormValues) {
    setFormError(null)
    const callbacks = { onSuccess: () => onSaved(mode), onError: handleMutationError }

    if (!isEdit) {
      createProject.mutate(
        { laboratoryId: values.laboratoryId, body: toCreateProjectPayload(values) },
        callbacks,
      )
      return
    }

    if (!effectiveProject) return
    updateProject.mutate({ id: effectiveProject.id, body: toUpdateProjectPayload(values) }, callbacks)
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="laboratoryId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-form-laboratory">Laboratório</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                    <SelectTrigger id="project-form-laboratory" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione o laboratório" />
                    </SelectTrigger>
                    <SelectContent>
                      {laboratories.map((laboratory) => (
                        <SelectItem key={laboratory.id} value={laboratory.id}>
                          {laboratory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="researchLineId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-form-research-line">Linha de pesquisa</FieldLabel>
                  <Select name={field.name} value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                    <SelectTrigger id="project-form-research-line" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione a linha" />
                    </SelectTrigger>
                    <SelectContent>
                      {researchLines.map((line) => (
                        <SelectItem key={line.id} value={line.id}>
                          {line.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEdit && <FieldDescription>A linha de pesquisa não pode ser alterada.</FieldDescription>}
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="project-form-name">Nome do projeto</FieldLabel>
                <Input {...field} id="project-form-name" maxLength={255} aria-invalid={fieldState.invalid} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="objective"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="project-form-objective">Objetivo</FieldLabel>
                <Textarea {...field} id="project-form-objective" rows={3} aria-invalid={fieldState.invalid} />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="project-form-description">Descrição</FieldLabel>
                <Textarea
                  {...field}
                  id="project-form-description"
                  rows={3}
                  maxLength={1000}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-form-status">Situação</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as ProjectStatus)}
                  >
                    <SelectTrigger id="project-form-status" className="h-10 w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatusValues.map((status) => (
                        <SelectItem key={status} value={status}>
                          {projectStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-form-start-date">Início</FieldLabel>
                  <Input {...field} id="project-form-start-date" type="date" className="h-10" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="project-form-end-date">Término</FieldLabel>
                  <Input {...field} id="project-form-end-date" type="date" className="h-10" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <Controller
            name="knowledgeAreas"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="project-form-knowledge-areas">Áreas do conhecimento</FieldLabel>
                <Textarea
                  {...field}
                  id="project-form-knowledge-areas"
                  rows={3}
                  aria-describedby="project-form-knowledge-areas-hint"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription id="project-form-knowledge-areas-hint">Informe uma área por linha.</FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
        {formError && (
          <p role="alert" className="mr-auto text-sm text-destructive">
            {formError}
          </p>
        )}
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar projeto'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function ProjectFormDialog({
  state,
  laboratories,
  researchLines,
  onOpenChange,
  onSaved,
}: {
  state: ProjectDialogState
  laboratories: Laboratory[]
  researchLines: ResearchLine[]
  onOpenChange: (open: boolean) => void
  onSaved: (mode: FormMode) => void
}) {
  const mode = state.open ? state.mode : 'create'
  const project = state.open && state.mode === 'edit' ? state.project : undefined

  return (
    <Dialog open={state.open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-2xl"
      >
        <DialogHeader className="relative border-b px-6 py-5 pr-14">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">
            {mode === 'create' ? 'Novo projeto' : 'Editar projeto'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Cadastre um projeto em um laboratório do grupo, vinculado a uma linha de pesquisa.'
              : 'Atualize os dados, a situação e o período deste projeto.'}
          </DialogDescription>
        </DialogHeader>
        {state.open && (
          <ProjectFormContent
            key={project?.id ?? 'create'}
            mode={mode}
            initialProject={project}
            laboratories={laboratories}
            researchLines={researchLines}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
