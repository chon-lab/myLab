import { useEffect, useState, type KeyboardEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiError } from '@/lib/api-client'
import {
  researchLinesKeys,
  useCreateResearchLineMutation,
  useResearchLineQuery,
  useUpdateResearchLineMutation,
} from '@/queries/research-lines/research-lines.queries'
import {
  mergeUniqueItems,
  researchLineFormSchema,
  splitDelimitedItems,
  toResearchLineFormFieldPath,
  toResearchLineFormValues,
  toResearchLinePayload,
  type ResearchLineFormValues,
} from '@/types/research-lines/research-line.schema'
import type { ResearchLine } from '@/types/research-lines/research-line.types'

export type ResearchLineDialogState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; line: ResearchLine }

function getSaveErrorMessage(error: unknown, mode: 'create' | 'edit') {
  if (!(error instanceof ApiError)) {
    return mode === 'create'
      ? 'Não foi possível criar a linha de pesquisa. Tente novamente.'
      : 'Não foi possível salvar as alterações. Tente novamente.'
  }

  if (error.status === 404) {
    return mode === 'create'
      ? 'Este grupo de pesquisa não foi encontrado. Ele pode ter sido removido.'
      : 'Esta linha de pesquisa não foi encontrada. Ela pode ter sido removida.'
  }

  if (error.status === 409) {
    return 'Os dados informados conflitam com informações já cadastradas.'
  }

  if (error.status === 400 && Object.keys(error.fieldErrors).length > 0) {
    return 'Revise os campos destacados e tente novamente.'
  }

  if (error.status === 400) {
    return 'O servidor recusou os dados informados. Revise os campos e tente novamente.'
  }

  return mode === 'create'
    ? 'Não foi possível criar a linha de pesquisa. Tente novamente.'
    : 'Não foi possível salvar as alterações. Tente novamente.'
}

function ResearchLineFormContent({
  researchGroupId,
  mode,
  initialLine,
  onSaved,
}: {
  researchGroupId: string
  mode: 'create' | 'edit'
  initialLine?: ResearchLine
  onSaved: (mode: 'create' | 'edit') => void
}) {
  const queryClient = useQueryClient()
  const detailQuery = useResearchLineQuery(
    mode === 'edit' && initialLine ? initialLine.id : null,
    initialLine,
  )
  const effectiveLine = mode === 'edit' ? (detailQuery.data ?? initialLine) : undefined

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    setFocus,
    formState: { isDirty },
  } = useForm<ResearchLineFormValues>({
    resolver: zodResolver(researchLineFormSchema),
    defaultValues: toResearchLineFormValues(effectiveLine),
  })

  const keywords = useWatch({ control, name: 'keywords' })
  const knowledgeAreas = useWatch({ control, name: 'knowledgeAreas' })

  const createLine = useCreateResearchLineMutation(researchGroupId)
  const updateLine = useUpdateResearchLineMutation()
  const isSubmitting = createLine.isPending || updateLine.isPending
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setFocus('name')
  }, [setFocus])

  useEffect(() => {
    if (mode === 'edit' && detailQuery.data && !isDirty) {
      reset(toResearchLineFormValues(detailQuery.data))
    }
  }, [detailQuery.data, isDirty, mode, reset])

  if (mode === 'edit' && detailQuery.isError) {
    const isNotFound = detailQuery.error instanceof ApiError && detailQuery.error.status === 404

    return (
      <div className="space-y-4 px-6 py-6">
        <p role="alert" className="text-sm text-destructive">
          {isNotFound
            ? 'Esta linha de pesquisa não foi encontrada. Ela pode ter sido removida.'
            : 'Não foi possível carregar os dados atualizados desta linha de pesquisa.'}
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
                if (isNotFound) {
                  void queryClient.invalidateQueries({ queryKey: researchLinesKeys.all })
                }
              }}
            >
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </div>
    )
  }

  function addKeywordsFromDraft() {
    const draft = getValues('keywordDraft')
    const parsed = splitDelimitedItems(draft)
    if (parsed.length === 0) return

    const invalid = parsed.find((item) => item.length > 255)
    if (invalid) {
      setError('keywordDraft', {
        type: 'manual',
        message: 'Cada palavra-chave deve ter no máximo 255 caracteres.',
      })
      return
    }

    clearErrors('keywordDraft')
    setValue('keywords', mergeUniqueItems(getValues('keywords'), parsed), { shouldDirty: true })
    setValue('keywordDraft', '', { shouldDirty: true })
  }

  function removeKeyword(keywordToRemove: string) {
    setValue(
      'keywords',
      getValues('keywords').filter((item) => item !== keywordToRemove),
      { shouldDirty: true },
    )
  }

  function addKnowledgeAreasFromDraft() {
    const draft = getValues('knowledgeAreaDraft')
    const parsed = splitDelimitedItems(draft)
    if (parsed.length === 0) return

    const invalid = parsed.find((item) => item.length > 500)
    if (invalid) {
      setError('knowledgeAreaDraft', {
        type: 'manual',
        message: 'Cada área do conhecimento deve ter no máximo 500 caracteres.',
      })
      return
    }

    clearErrors('knowledgeAreaDraft')
    setValue('knowledgeAreas', mergeUniqueItems(getValues('knowledgeAreas'), parsed), {
      shouldDirty: true,
    })
    setValue('knowledgeAreaDraft', '', { shouldDirty: true })
  }

  function removeKnowledgeArea(areaToRemove: string) {
    setValue(
      'knowledgeAreas',
      getValues('knowledgeAreas').filter((item) => item !== areaToRemove),
      { shouldDirty: true },
    )
  }

  function handleDraftKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    onCommit: () => void,
  ) {
    if (event.key === 'Enter') {
      event.preventDefault()
      onCommit()
    }
  }

  function handleMutationError(error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        void queryClient.invalidateQueries({ queryKey: researchLinesKeys.all })
      }
      Object.entries(error.fieldErrors).forEach(([apiField, message]) => {
        setError(toResearchLineFormFieldPath(apiField), { type: 'server', message })
      })
    }
    setFormError(getSaveErrorMessage(error, mode))
  }

  function submit(values: ResearchLineFormValues) {
    setFormError(null)
    const payload = toResearchLinePayload(values)

    if (mode === 'create') {
      createLine.mutate(payload, {
        onSuccess: () => onSaved('create'),
        onError: handleMutationError,
      })
      return
    }

    if (!effectiveLine) return

    updateLine.mutate(
      { id: effectiveLine.id, body: payload },
      {
        onSuccess: () => onSaved('edit'),
        onError: handleMutationError,
      },
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <FieldGroup>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="research-line-form-name">Nome da linha de pesquisa</FieldLabel>
                <Input
                  {...field}
                  id="research-line-form-name"
                  maxLength={255}
                  placeholder="Ex.: Sensores eletroquímicos para monitoramento ambiental"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="objective"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="research-line-form-objective">Objetivo</FieldLabel>
                <Textarea
                  {...field}
                  id="research-line-form-objective"
                  rows={3}
                  placeholder="Descreva os temas e objetivos investigados nesta linha de pesquisa."
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="keywordDraft"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="research-line-form-keywords">Palavras-chave</FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    {...field}
                    id="research-line-form-keywords"
                    placeholder="Ex.: eletroquímica, metais pesados"
                    aria-invalid={fieldState.invalid}
                    aria-describedby="research-line-form-keywords-hint"
                    onKeyDown={(event) => handleDraftKeyDown(event, addKeywordsFromDraft)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addKeywordsFromDraft}
                    className="shrink-0"
                  >
                    <Plus aria-hidden="true" />
                    Adicionar
                  </Button>
                </div>
                <FieldDescription id="research-line-form-keywords-hint">
                  Separe por vírgula ou pressione Enter para adicionar cada palavra-chave.
                </FieldDescription>
                {keywords.length > 0 && (
                  <ul
                    aria-label="Palavras-chave adicionadas"
                    className="mt-1 flex flex-wrap gap-1.5"
                  >
                    {keywords.map((keyword) => (
                      <li key={keyword}>
                        <Badge
                          variant="outline"
                          className="h-auto gap-1.5 rounded-full border-slate-200 bg-slate-50 py-1 pr-1.5 pl-2.5 text-xs font-medium whitespace-normal text-brand-navy"
                        >
                          <span>{keyword}</span>
                          <button
                            type="button"
                            aria-label={`Remover palavra-chave ${keyword}`}
                            onClick={() => removeKeyword(keyword)}
                            className="inline-grid size-4 place-items-center rounded-full text-muted-foreground hover:bg-slate-200 hover:text-brand-navy"
                          >
                            <X aria-hidden="true" className="size-3" />
                          </button>
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="knowledgeAreaDraft"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="research-line-form-knowledge-areas">
                  Áreas do conhecimento
                </FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    {...field}
                    id="research-line-form-knowledge-areas"
                    placeholder="Ex.: Química Analítica; Ciências Ambientais"
                    aria-invalid={fieldState.invalid}
                    aria-describedby="research-line-form-knowledge-areas-hint"
                    onKeyDown={(event) => handleDraftKeyDown(event, addKnowledgeAreasFromDraft)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addKnowledgeAreasFromDraft}
                    className="shrink-0"
                  >
                    <Plus aria-hidden="true" />
                    Adicionar
                  </Button>
                </div>
                <FieldDescription id="research-line-form-knowledge-areas-hint">
                  Separe por ponto e vírgula, vírgula ou pressione Enter para adicionar.
                </FieldDescription>
                {knowledgeAreas.length > 0 && (
                  <ul
                    aria-label="Áreas do conhecimento adicionadas"
                    className="mt-1 flex flex-wrap gap-1.5"
                  >
                    {knowledgeAreas.map((area) => (
                      <li key={area}>
                        <Badge
                          variant="outline"
                          className="h-auto gap-1.5 rounded-full border-slate-200 bg-slate-50 py-1 pr-1.5 pl-2.5 text-xs font-medium whitespace-normal text-brand-navy"
                        >
                          <span>{area}</span>
                          <button
                            type="button"
                            aria-label={`Remover área do conhecimento ${area}`}
                            onClick={() => removeKnowledgeArea(area)}
                            className="inline-grid size-4 place-items-center rounded-full text-muted-foreground hover:bg-slate-200 hover:text-brand-navy"
                          >
                            <X aria-hidden="true" className="size-3" />
                          </button>
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
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
          {isSubmitting
            ? 'Salvando…'
            : mode === 'create'
              ? 'Criar linha de pesquisa'
              : 'Salvar alterações'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function ResearchLineFormDialog({
  researchGroupId,
  state,
  onOpenChange,
  onSaved,
}: {
  researchGroupId: string
  state: ResearchLineDialogState
  onOpenChange: (open: boolean) => void
  onSaved: (mode: 'create' | 'edit') => void
}) {
  const isOpen = state.open
  const mode = state.open ? state.mode : 'create'
  const line = state.open && state.mode === 'edit' ? state.line : undefined

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
            {mode === 'create' ? 'Nova linha de pesquisa' : 'Editar linha de pesquisa'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Cadastre um tema investigado pelo grupo, com objetivo, palavras-chave e áreas do conhecimento.'
              : 'Atualize o nome, o objetivo, as palavras-chave e as áreas do conhecimento desta linha.'}
          </DialogDescription>
        </DialogHeader>
        {isOpen && (
          <ResearchLineFormContent
            key={mode === 'edit' && line ? line.id : 'create'}
            researchGroupId={researchGroupId}
            mode={mode}
            initialLine={line}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

