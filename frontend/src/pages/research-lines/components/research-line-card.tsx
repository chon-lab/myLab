import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ResearchLine } from "@/types/research-lines/research-line.types"

export function ResearchLineCard({
  line,
  memberCount,
  projectCount,
  onEdit,
  onDelete,
}: {
  line: ResearchLine
  memberCount: number | null
  projectCount: number | null
  onEdit: (line: ResearchLine) => void
  onDelete: (line: ResearchLine) => void
}) {
  const titleId = `research-line-title-${line.id}`
  const hasCounts = memberCount !== null || projectCount !== null

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-card p-5 shadow-xs sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-6"
    >
      <div className="min-w-0 flex-1">
        <h2
          id={titleId}
          className="text-base font-bold break-words text-brand-navy"
        >
          {line.name}
        </h2>
        <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-line text-muted-foreground">
          {line.objective}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">
            Palavras-chave
          </span>
          {line.keywords.length > 0 ? (
            <ul
              aria-label={`Palavras-chave de ${line.name}`}
              className="flex flex-wrap items-center gap-1.5"
            >
              {line.keywords.map((keyword) => (
                <li key={keyword}>
                  <Badge
                    variant="outline"
                    className="h-auto rounded-full border-slate-200 bg-card px-2.5 py-0.5 text-xs font-medium whitespace-normal text-brand-navy"
                  >
                    {keyword}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs text-muted-foreground">
              Nenhuma informada
            </span>
          )}
        </div>

        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-muted-foreground">
            Áreas do conhecimento
          </span>{" "}
          <span className="text-brand-navy/85">
            {line.knowledgeAreas.length > 0
              ? line.knowledgeAreas.join("; ")
              : "Nenhuma informada"}
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:shrink-0 sm:justify-end sm:gap-6 sm:border-0 sm:pt-0">
        {hasCounts && (
          <dl className="flex items-center gap-5 sm:gap-6">
            {memberCount !== null && (
              <div className="flex flex-col items-center text-center">
                <dt className="order-2 mt-1 text-xs text-muted-foreground">
                  {memberCount === 1 ? "membro" : "membros"}
                </dt>
                <dd className="order-1 text-lg leading-none font-bold text-brand-navy sm:text-xl">
                  {memberCount}
                </dd>
              </div>
            )}
            {projectCount !== null && (
              <div className="flex flex-col items-center text-center">
                <dt className="order-2 mt-1 text-xs text-muted-foreground">
                  {projectCount === 1 ? "projeto" : "projetos"}
                </dt>
                <dd className="order-1 text-lg leading-none font-bold text-brand-navy sm:text-xl">
                  {projectCount}
                </dd>
              </div>
            )}
          </dl>
        )}

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${line.name}`}
            onClick={() => onEdit(line)}
          >
            <Pencil
              aria-hidden="true"
              className="size-5 sm:size-4"
            />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Excluir ${line.name}`}
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(line)}
          >
            <Trash2
              aria-hidden="true"
              className="size-5 sm:size-4"
            />
          </Button>
        </div>


      </div>
    </article>
  )
}
