import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'

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
import { ApiError } from '@/lib/api-client'
import { projectsKeys, useDeleteProjectMutation } from '@/queries/projects/projects.queries'
import type { Project } from '@/types/projects/project.types'

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 404) {
    return 'Este projeto não foi encontrado ou já foi removido.'
  }
  return 'Não foi possível excluir o projeto. Tente novamente.'
}

function DeleteProjectDialogBody({ project, onDeleted }: { project: Project; onDeleted: () => void }) {
  const queryClient = useQueryClient()
  const deleteProject = useDeleteProjectMutation()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function confirmDelete() {
    setDeleteError(null)
    deleteProject.mutate(project.id, {
      onSuccess: onDeleted,
      onError: (error) => {
        if (error instanceof ApiError && error.status === 404) {
          void queryClient.invalidateQueries({ queryKey: projectsKeys.all })
        }
        setDeleteError(getDeleteErrorMessage(error))
      },
    })
  }

  return (
    <>
      <div className="space-y-3 px-6 py-5">
        <p className="text-sm leading-relaxed text-brand-navy">
          Tem certeza de que deseja excluir o projeto{' '}
          <strong className="font-semibold">“{project.name}”</strong>?
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          O projeto e os documentos anexados a ele deixam de ficar disponíveis.
        </p>
        {deleteError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {deleteError}
          </p>
        )}
      </div>

      <DialogFooter className="mx-0 mb-0 gap-3 px-6 py-4 sm:items-center">
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={deleteProject.isPending}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="button" variant="destructive" disabled={deleteProject.isPending} onClick={confirmDelete}>
          {deleteProject.isPending ? 'Excluindo…' : 'Excluir projeto'}
        </Button>
      </DialogFooter>
    </>
  )
}

export function DeleteProjectDialog({
  project,
  onOpenChange,
  onDeleted,
}: {
  project: Project | null
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}) {
  return (
    <Dialog open={project !== null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="flex max-h-dvh flex-col gap-0 p-0 sm:max-h-[90svh] sm:max-w-lg">
        <DialogHeader className="relative border-b px-6 py-5 pr-14">
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar" className="absolute top-4 right-4">
              <X aria-hidden="true" />
            </Button>
          </DialogClose>
          <DialogTitle className="text-lg font-bold text-brand-navy">Excluir projeto</DialogTitle>
          <DialogDescription>Confirme a remoção deste projeto do laboratório.</DialogDescription>
        </DialogHeader>
        {project && <DeleteProjectDialogBody key={project.id} project={project} onDeleted={onDeleted} />}
      </DialogContent>
    </Dialog>
  )
}
