import { useEffect, useState, type ChangeEvent, type DragEvent } from 'react'
import { Download, FileText, LoaderCircle, Trash2, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { formatFileSize, formatUploadDate } from '@/lib/file-format'
import {
  useDeleteInventoryEntryDocumentMutation,
  useDownloadInventoryEntryDocumentMutation,
  useInventoryEntryDocumentsQuery,
  useUploadInventoryEntryDocumentMutation,
} from '@/queries/inventory/inventory.queries'
import type { InventoryEntryDocumentSummary } from '@/types/inventory/inventory.types'

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024

function getFileKind(document: InventoryEntryDocumentSummary) {
  const extension = document.fileName?.split('.').pop()?.toLocaleUpperCase('pt-BR')
  if (extension && extension !== document.fileName?.toLocaleUpperCase('pt-BR')) return extension
  return document.contentType?.split('/')[1]?.toLocaleUpperCase('pt-BR') ?? 'ARQ'
}

export function InventoryEntryDocuments({ entryId }: { entryId: string }) {
  const documentsQuery = useInventoryEntryDocumentsQuery(entryId)
  const uploadDocument = useUploadInventoryEntryDocumentMutation()
  const downloadDocument = useDownloadInventoryEntryDocumentMutation()
  const deleteDocument = useDeleteInventoryEntryDocumentMutation()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (documentsQuery.isError) publishApiErrorToast(documentsQuery.error)
  }, [documentsQuery.error, documentsQuery.isError])

  function addFiles(files: FileList | File[]) {
    const acceptedFiles: File[] = []
    const invalidFiles: string[] = []

    Array.from(files).forEach((file) => {
      if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES || file.name.length > 255) {
        invalidFiles.push(file.name)
        return
      }
      acceptedFiles.push(file)
    })

    if (invalidFiles.length > 0) {
      publishToast({
        kind: 'error',
        title: 'Arquivo não pode ser anexado',
        description: `${invalidFiles.join(', ')}. Selecione arquivos com até 20 MB e nome de até 255 caracteres.`,
      })
    }

    if (acceptedFiles.length > 0) {
      setSelectedFiles((current) => {
        const existing = new Set(current.map((file) => `${file.name}:${file.size}:${file.lastModified}`))
        return [
          ...current,
          ...acceptedFiles.filter((file) => !existing.has(`${file.name}:${file.size}:${file.lastModified}`)),
        ]
      })
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files)
    event.target.value = ''
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  async function uploadFiles() {
    for (const file of selectedFiles) {
      try {
        await uploadDocument.mutateAsync({ entryId, body: { file } })
        setSelectedFiles((current) => current.filter((candidate) => candidate !== file))
      } catch (error) {
        publishApiErrorToast(error)
        return
      }
    }

    if (selectedFiles.length > 0) {
      publishToast({
        kind: 'success',
        title: 'Documentos anexados',
        description: 'Os arquivos foram associados à entrada.',
      })
    }
  }

  function download(document: InventoryEntryDocumentSummary) {
    if (!document.fileAvailable) return

    downloadDocument.mutate(
      { entryId, documentId: document.id },
      {
        onSuccess: (blob) => {
          const objectUrl = URL.createObjectURL(blob)
          const link = window.document.createElement('a')
          link.href = objectUrl
          link.download = document.fileName ?? 'documento'
          window.document.body.append(link)
          link.click()
          link.remove()
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
        },
        onError: publishApiErrorToast,
      },
    )
  }

  function remove(document: InventoryEntryDocumentSummary) {
    deleteDocument.mutate(
      { entryId, documentId: document.id },
      {
        onSuccess: () => publishToast({
          kind: 'success',
          title: 'Documento removido',
          description: 'O arquivo foi removido desta entrada.',
        }),
        onError: publishApiErrorToast,
      },
    )
  }

  return (
    <section aria-labelledby="inventory-entry-documents-title" className="space-y-3">
      <header className="flex items-center justify-between gap-3">
        <h2 id="inventory-entry-documents-title" className="text-sm font-bold text-brand-navy">
          Documentos
        </h2>
        {documentsQuery.data && (
          <span className="text-xs text-muted-foreground">
            {documentsQuery.data.length} {documentsQuery.data.length === 1 ? 'arquivo' : 'arquivos'}
          </span>
        )}
      </header>

      <label
        htmlFor="inventory-entry-document-upload"
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-5 text-center transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50 hover:border-primary/50'}`}
      >
        <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <Upload aria-hidden="true" className="size-5" />
        </span>
        <span className="text-sm font-semibold text-brand-navy">Arraste arquivos para cá</span>
        <span className="text-xs text-muted-foreground">ou escolha no computador · até 20 MB por arquivo</span>
        <input
          id="inventory-entry-document-upload"
          type="file"
          multiple
          className="sr-only"
          onChange={onFileChange}
        />
      </label>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <ul aria-label="Arquivos prontos para anexar" className="space-y-2">
            {selectedFiles.map((file) => (
              <li key={`${file.name}:${file.size}:${file.lastModified}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-card px-3 py-2">
                <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-brand-navy">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remover ${file.name} da lista de envio`}
                  className="size-9 shrink-0 sm:size-7"
                  disabled={uploadDocument.isPending}
                  onClick={() => setSelectedFiles((current) => current.filter((candidate) => candidate !== file))}
                >
                  <X aria-hidden="true" className="size-5 sm:size-4" />
                </Button>
              </li>
            ))}
          </ul>
          <Button type="button" className="w-full" disabled={uploadDocument.isPending} onClick={() => void uploadFiles()}>
            {uploadDocument.isPending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Upload aria-hidden="true" />}
            {uploadDocument.isPending ? 'Anexando…' : 'Anexar documentos'}
          </Button>
        </div>
      )}

      {documentsQuery.isPending ? (
        <p role="status" className="py-3 text-center text-sm text-muted-foreground">Carregando documentos…</p>
      ) : documentsQuery.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-3 text-sm">
          <p role="alert" className="text-destructive">Não foi possível carregar os documentos desta entrada.</p>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => void documentsQuery.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : documentsQuery.data?.length ? (
        <ul aria-label="Documentos anexados à entrada" className="divide-y divide-slate-200 rounded-xl border border-slate-200">
          {documentsQuery.data.map((document) => (
            <li key={document.id} className="flex items-center gap-3 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-[0.55rem] font-bold text-brand-navy">
                {getFileKind(document).slice(0, 4)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-brand-navy">{document.fileName ?? 'Documento sem arquivo'}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {document.fileName ? `${formatFileSize(document.sizeBytes)} · ` : ''}{formatUploadDate(document.uploadedAt)}
                </p>
              </div>
              {document.fileAvailable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Baixar ${document.fileName ?? 'documento'}`}
                  title="Baixar documento"
                  className="size-10 shrink-0 sm:size-8"
                  disabled={downloadDocument.isPending}
                  onClick={() => download(document)}
                >
                  {downloadDocument.isPending ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin sm:size-4" /> : <Download aria-hidden="true" className="size-5 sm:size-4" />}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Excluir ${document.fileName ?? 'documento'}`}
                title="Excluir documento"
                className="size-10 shrink-0 text-destructive hover:text-destructive sm:size-8"
                disabled={deleteDocument.isPending}
                onClick={() => remove(document)}
              >
                {deleteDocument.isPending ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin sm:size-4" /> : <Trash2 aria-hidden="true" className="size-5 sm:size-4" />}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-slate-200 bg-card px-3 py-4 text-center text-sm text-muted-foreground">
          Nenhum documento anexado a esta entrada.
        </p>
      )}
    </section>
  )
}
