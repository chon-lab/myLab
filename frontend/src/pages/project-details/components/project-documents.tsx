import { useState, type ChangeEvent } from 'react'
import { Download, FileText, LoaderCircle, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api-client'
import { publishToast } from '@/lib/api-error-toasts'
import { formatFileSize, formatUploadDate } from '@/lib/file-format'
import {
  useDeleteProjectDocumentMutation,
  useDownloadProjectDocumentMutation,
  useUploadProjectDocumentMutation,
} from '@/queries/projects/projects.queries'
import type { ProjectDocument } from '@/types/projects/project.types'

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

function getDocumentErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 413) return 'O arquivo ultrapassa o limite de 20 MB.'
    if (error.status === 404) return 'O projeto ou o documento não foi encontrado. Ele pode ter sido removido.'
    if (error.status === 400 && error.message) return error.message
  }
  return fallback
}

function publishDocumentError(title: string, error: unknown, fallback: string) {
  publishToast({ kind: 'error', title, description: getDocumentErrorMessage(error, fallback) })
}

function saveBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = window.document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  window.document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

export function ProjectDocuments({ projectId, documents }: { projectId: string; documents: ProjectDocument[] }) {
  const uploadDocument = useUploadProjectDocumentMutation()
  const downloadDocument = useDownloadProjectDocumentMutation()
  const deleteDocument = useDeleteProjectDocumentMutation()
  const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(null)

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    const invalidFiles = files.filter((file) => file.size === 0 || file.size > MAX_FILE_SIZE_BYTES)
    if (invalidFiles.length > 0) {
      publishToast({
        kind: 'error',
        title: 'Arquivo não pode ser enviado',
        description: `${invalidFiles.map((file) => file.name).join(', ')}. Selecione arquivos não vazios de até 20 MB.`,
      })
    }

    const validFiles = files.filter((file) => !invalidFiles.includes(file))
    for (const file of validFiles) {
      try {
        await uploadDocument.mutateAsync({ projectId, file })
      } catch (error) {
        publishDocumentError(`Falha ao enviar ${file.name}`, error, 'Não foi possível enviar o arquivo. Tente novamente.')
        return
      }
    }

    if (validFiles.length > 0) {
      publishToast({
        kind: 'success',
        title: validFiles.length === 1 ? 'Documento enviado' : 'Documentos enviados',
        description: 'Os arquivos foram anexados ao projeto.',
      })
    }
  }

  function download(document: ProjectDocument) {
    setPendingDocumentId(document.id)
    downloadDocument.mutate(
      { projectId, documentId: document.id },
      {
        onSuccess: (blob) => saveBlob(blob, document.fileName),
        onError: (error) =>
          publishDocumentError('Falha no download', error, 'Não foi possível baixar o documento. Tente novamente.'),
        onSettled: () => setPendingDocumentId(null),
      },
    )
  }

  function remove(document: ProjectDocument) {
    setPendingDocumentId(document.id)
    deleteDocument.mutate(
      { projectId, documentId: document.id },
      {
        onSuccess: () =>
          publishToast({ kind: 'success', title: 'Documento removido', description: `${document.fileName} foi removido do projeto.` }),
        onError: (error) =>
          publishDocumentError('Falha ao remover', error, 'Não foi possível remover o documento. Tente novamente.'),
        onSettled: () => setPendingDocumentId(null),
      },
    )
  }

  return (
    <section aria-labelledby="project-documents-title" className="rounded-xl border border-slate-200 bg-card p-5 shadow-xs">
      <header className="flex items-center justify-between gap-3">
        <h2 id="project-documents-title" className="text-base font-bold text-brand-navy">
          Documentos
        </h2>
        <span className="text-xs text-muted-foreground">
          {documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}
        </span>
      </header>

      <label
        htmlFor="project-document-upload"
        className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition-colors hover:border-primary/50 has-focus-visible:border-primary"
      >
        <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          {uploadDocument.isPending ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <Upload aria-hidden="true" className="size-5" />
          )}
        </span>
        <span className="text-sm font-semibold text-brand-navy">
          {uploadDocument.isPending ? 'Enviando…' : 'Enviar documentos'}
        </span>
        <span className="text-xs text-muted-foreground">Até 20 MB por arquivo</span>
        <input
          id="project-document-upload"
          type="file"
          multiple
          className="sr-only"
          disabled={uploadDocument.isPending}
          onChange={(event) => void uploadFiles(event)}
        />
      </label>

      {documents.length === 0 ? (
        <p className="mt-4 rounded-lg border border-slate-200 px-3 py-4 text-center text-sm text-muted-foreground">
          Nenhum documento anexado a este projeto.
        </p>
      ) : (
        <ul aria-label="Documentos do projeto" className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
          {documents.map((document) => {
            const isBusy = pendingDocumentId === document.id

            return (
              <li key={document.id} className="flex items-center gap-3 p-3">
                <FileText aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-navy">{document.fileName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatFileSize(document.sizeBytes)} · {formatUploadDate(document.uploadedAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Baixar ${document.fileName}`}
                  className="size-10 shrink-0 sm:size-8"
                  disabled={isBusy}
                  onClick={() => download(document)}
                >
                  <Download aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Excluir ${document.fileName}`}
                  className="size-10 shrink-0 text-destructive hover:text-destructive sm:size-8"
                  disabled={isBusy}
                  onClick={() => remove(document)}
                >
                  {isBusy ? (
                    <LoaderCircle aria-hidden="true" className="size-5 animate-spin sm:size-4" />
                  ) : (
                    <Trash2 aria-hidden="true" className="size-5 sm:size-4" />
                  )}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
