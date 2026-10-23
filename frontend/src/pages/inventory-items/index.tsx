import { useEffect, useState, type ReactNode } from 'react'
import { Boxes, Plus, Search } from 'lucide-react'

import { useResearchGroup } from '@/components/layout/research-group-context'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError } from '@/lib/api-client'
import { publishApiErrorToast, publishToast } from '@/lib/api-error-toasts'
import { ArchiveInventoryItemDialog } from '@/pages/inventory-items/components/archive-inventory-item-dialog'
import { InventoryItemCard } from '@/pages/inventory-items/components/inventory-item-card'
import {
  InventoryItemFormSheet,
  type InventoryItemSheetState,
} from '@/pages/inventory-items/components/inventory-item-form-sheet'
import { InventoryItemsTable } from '@/pages/inventory-items/components/inventory-items-table'
import { formatItemTypeLabel } from '@/pages/inventory-stock/inventory-stock-format'
import { useInventoryItemsQuery } from '@/queries/inventory/inventory.queries'
import { inventoryItemTypeValues } from '@/types/inventory/inventory-item.schema'
import type { InventoryItem, InventoryItemType } from '@/types/inventory/inventory.types'

type ItemTypeFilter = InventoryItemType | 'ALL'
type ItemStatusFilter = 'ALL' | 'ACTIVE' | 'ARCHIVED'

const statusFilterLabels: Record<ItemStatusFilter, string> = {
  ALL: 'Ativos e arquivados',
  ACTIVE: 'Ativos',
  ARCHIVED: 'Arquivados',
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function matchesItemFilters(
  item: InventoryItem,
  rawQuery: string,
  typeFilter: ItemTypeFilter,
  statusFilter: ItemStatusFilter,
) {
  if (typeFilter !== 'ALL' && item.itemType !== typeFilter) return false
  if (statusFilter === 'ACTIVE' && !item.active) return false
  if (statusFilter === 'ARCHIVED' && item.active) return false

  const query = normalizeSearchText(rawQuery.trim())
  if (!query) return true

  return [item.name, item.description ?? ''].some((field) =>
    normalizeSearchText(field).includes(query),
  )
}

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="inventory-items-title" className="max-w-xl">
      <h1 id="inventory-items-title" className="text-2xl font-bold tracking-tight text-brand-navy">
        {title}
      </h1>
      {children}
    </section>
  )
}

export function InventoryItemsPage() {
  const selectedGroup = useResearchGroup()
  const { data: items, isPending, isError, error, refetch } = useInventoryItemsQuery(
    selectedGroup.id,
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<ItemStatusFilter>('ALL')
  const [formSheet, setFormSheet] = useState<InventoryItemSheetState>({ open: false })
  const [itemToArchive, setItemToArchive] = useState<InventoryItem | null>(null)

  useEffect(() => {
    if (isError) publishApiErrorToast(error)
  }, [error, isError])

  if (isPending) {
    return (
      <PageState title="Itens">
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Carregando o catálogo de itens…
        </p>
      </PageState>
    )
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404

    return (
      <PageState title={notFound ? 'Grupo não encontrado' : 'Não foi possível carregar os itens'}>
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? 'Este grupo de pesquisa pode ter sido removido. Selecione outro grupo no menu lateral.'
            : 'Confira sua conexão e tente novamente.'}
        </p>
        {!notFound && (
          <Button className="mt-6" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        )}
      </PageState>
    )
  }

  const filteredItems = items.filter((item) =>
    matchesItemFilters(item, searchQuery, typeFilter, statusFilter),
  )

  function openCreateSheet() {
    setFormSheet({ open: true, mode: 'create' })
  }

  function openEditSheet(item: InventoryItem) {
    setFormSheet({ open: true, mode: 'edit', item })
  }

  function clearFilters() {
    setSearchQuery('')
    setTypeFilter('ALL')
    setStatusFilter('ALL')
  }

  return (
    <section aria-labelledby="inventory-items-title">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 id="inventory-items-title" className="text-3xl font-bold tracking-tight text-brand-navy">
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">Itens</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Catálogo de tudo que o grupo pode ter em estoque.
          </p>
        </div>

        <Button
          size="lg"
          className="h-10 w-full shrink-0 px-4 font-semibold sm:w-auto"
          onClick={openCreateSheet}
        >
          <Plus aria-hidden="true" />
          Novo item
        </Button>
      </header>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="inventory-items-search" className="block text-xs font-semibold text-brand-navy">
            Buscar
          </label>
          <InputGroup className="mt-1.5 h-10 w-full bg-card">
            <InputGroupAddon align="inline-start" className="pl-3">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              id="inventory-items-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Nome do item"
              className="h-full text-sm"
            />
          </InputGroup>
        </div>

        <div className="w-full sm:w-44">
          <label htmlFor="inventory-items-type-filter" className="block text-xs font-semibold text-brand-navy">
            Tipo
          </label>
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ItemTypeFilter)}>
            <SelectTrigger
              id="inventory-items-type-filter"
              className="mt-1.5 h-10 w-full bg-card px-3 text-sm font-medium text-brand-navy"
            >
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {inventoryItemTypeValues.map((itemType) => (
                <SelectItem key={itemType} value={itemType}>
                  {formatItemTypeLabel(itemType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <label htmlFor="inventory-items-status-filter" className="block text-xs font-semibold text-brand-navy">
            Situação
          </label>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ItemStatusFilter)}
          >
            <SelectTrigger
              id="inventory-items-status-filter"
              className="mt-1.5 h-10 w-full bg-card px-3 text-sm font-medium text-brand-navy"
            >
              <SelectValue placeholder={statusFilterLabels.ALL} />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(statusFilterLabels) as ItemStatusFilter[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {statusFilterLabels[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <section
          aria-labelledby="inventory-items-empty-title"
          className="mt-5 rounded-xl border border-dashed border-slate-200 bg-card px-6 py-12 text-center"
        >
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Boxes aria-hidden="true" className="size-5" />
          </span>
          <h2 id="inventory-items-empty-title" className="mt-4 text-base font-bold text-brand-navy">
            Nenhum item no catálogo
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Cadastre os itens que o grupo usa para poder registrar entradas, saídas e
            transferências de estoque.
          </p>
          <Button className="mt-5 font-semibold" onClick={openCreateSheet}>
            <Plus aria-hidden="true" />
            Novo item
          </Button>
        </section>
      ) : filteredItems.length === 0 ? (
        <section
          aria-labelledby="inventory-items-no-match-title"
          className="mt-5 rounded-xl border border-slate-200 bg-card px-6 py-10 text-center"
        >
          <h2 id="inventory-items-no-match-title" className="text-base font-bold text-brand-navy">
            Nenhum item encontrado
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nenhum item corresponde aos filtros selecionados.
          </p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </section>
      ) : (
        <div className="mt-5">
          <div className="hidden md:block">
            <InventoryItemsTable items={filteredItems} onEdit={openEditSheet} />
          </div>
          <ul aria-label="Itens do catálogo" className="space-y-3 md:hidden">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <InventoryItemCard item={item} onEdit={openEditSheet} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {filteredItems.length} de {items.length}{' '}
            {items.length === 1 ? 'item no catálogo' : 'itens no catálogo'}
          </p>
        </div>
      )}

      <InventoryItemFormSheet
        researchGroupId={selectedGroup.id}
        state={formSheet}
        onOpenChange={(open) => {
          if (!open) setFormSheet({ open: false })
        }}
        onSaved={(mode) => {
          setFormSheet({ open: false })
          publishToast({
            kind: 'success',
            title: mode === 'create' ? 'Item criado' : 'Item atualizado',
            description: 'As alterações foram salvas.',
          })
        }}
        onArchive={setItemToArchive}
      />

      <ArchiveInventoryItemDialog
        item={itemToArchive}
        onOpenChange={(open) => {
          if (!open) setItemToArchive(null)
        }}
        onArchived={() => {
          setItemToArchive(null)
          setFormSheet({ open: false })
          publishToast({
            kind: 'success',
            title: 'Item arquivado',
            description: 'O item foi removido do catálogo.',
          })
        }}
      />
    </section>
  )
}
