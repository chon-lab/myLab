export function formatFileSize(sizeBytes: number | null) {
  if (sizeBytes === null) return 'Tamanho indisponível'
  if (sizeBytes < 1024) return `${sizeBytes} B`
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB`
  return `${(sizeBytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`
}

export function formatUploadDate(uploadedAt: string | null) {
  if (!uploadedAt) return 'Data não informada'
  const date = new Date(uploadedAt)
  return Number.isNaN(date.getTime())
    ? 'Data não informada'
    : `Enviado em ${new Intl.DateTimeFormat('pt-BR').format(date)}`
}
