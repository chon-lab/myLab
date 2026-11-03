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

function publishDocumentError(title: string, error: unknown, fallback: string) {
  const description = error instanceof ApiError
    ? error.status === 413
      ? 'O arquivo ultrapassa o limite de 20 MB.'
      : error.status === 404
        ? 'O projeto ou documento não foi encontrado. Atualize a lista e tente novamente.'
        : error.message || fallback
    : fallback

  publishToast({ kind: 'error', title, description })
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

    const invalidFiles = files.filter((file) => file.size === 0 || file.size > MAX_FILE_SIZE_BYTES || file.name.length > 255)
    if (invalidFiles.length > 0) {
      publishToast({
        kind: 'error',
        title: 'Arquivo não pode ser enviado',
        description: `${invalidFiles.map((file) => file.name).join(', ')}. Escolha arquivos não vazios de até 20 MB e com nome de até 255 caracteres.`,
      })
    }

    const validFiles = files.filter((file) => !invalidFiles.includes(file))
    for (const file of validFiles) {
      try {
        await uploadDocument.mutateAsync({ projectId, file })
      } catch (error) {
        publishDocumentError(`Falha ao enviar ${file.name}`, error, 'Não foi possível enviar o arquivo.')
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
        onError: (error) => publishDocumentError('Falha no download', error, 'Não foi possível baixar o documento.'),
        onSettled: () => setPendingDocumentId(null),
      },
    )
  }

  function remove(document: ProjectDocument) {
    setPendingDocumentId(document.id)
    deleteDocument.mutate(
      { projectId, documentId: document.id },
      {
        onSuccess: () => publishToast({ kind: 'success', title: 'Documento removido', description: `${document.fileName} foi removido do projeto.` }),
        onError: (error) => publishDocumentError('Falha ao remover', error, 'Não foi possível remover o documento.'),
        onSettled: () => setPendingDocumentId(null),
      },
    )
  }

  return (
    <section aria-labelledby="project-documents-title" className="space-y-3">
      <header className="flex items-center justify-between gap-3">
        <h2 id="project-documents-title" className="text-sm font-bold text-brand-navy">Documentos</h2>
        <span className="text-xs text-muted-foreground">
          {documents.length} {documents.length === 1 ? 'arquivo' : 'arquivos'}
        </span>
      </header>

      <label
        htmlFor="project-document-upload"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-5 text-center transition-colors hover:border-primary/50 has-focus-visible:border-primary"
      >
        <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          {uploadDocument.isPending
            ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
            : <Upload aria-hidden="true" className="size-5" />}
        </span>
        <span className="text-sm font-semibold text-brand-navy">
          {uploadDocument.isPending ? 'Enviando…' : 'Escolher documentos'}
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
        <p className="rounded-lg border border-border bg-card px-3 py-4 text-center text-sm text-muted-foreground">
          Nenhum documento anexado a este projeto.
        </p>
      ) : (
        <ul aria-label="Documentos do projeto" className="divide-y divide-border rounded-xl border border-border">
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
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Baixar ${document.fileName}`}
                    title="Baixar documento"
                    className="size-10 text-muted-foreground hover:text-primary sm:size-8"
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
                    title="Excluir documento"
                    className="size-10 text-muted-foreground hover:text-destructive sm:size-8"
                    disabled={isBusy}
                    onClick={() => remove(document)}
                  >
                    {isBusy
                      ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin sm:size-4" />
                      : <Trash2 aria-hidden="true" className="size-5 sm:size-4" />}
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
