import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  CircleDollarSign,
  Search,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

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
import { publishApiErrorToast } from '@/lib/api-error-toasts'
import { cn } from '@/lib/utils'
import { InventoryStockCard } from '@/pages/inventory-stock/components/inventory-stock-card'
import { InventoryStockItemDetailsDialog } from '@/pages/inventory-stock/components/inventory-stock-item-details-dialog'
import { InventoryStockTable } from '@/pages/inventory-stock/components/inventory-stock-table'
import {
  buildInventoryShortcutPath,
  formatCurrencyBRL,
} from '@/pages/inventory-stock/inventory-stock-format'
import {
  useInventoryItemsQuery,
  useInventoryLaboratoriesQuery,
  useInventoryLaboratoryBreakdownsQuery,
  useInventoryStockQuery,
} from '@/queries/inventory/inventory.queries'
import type {
  InventoryItem,
  InventoryItemType,
  InventoryLaboratoryStockBreakdown,
  InventoryStockItem,
} from '@/types/inventory/inventory.types'

type ItemTypeFilter = 'ALL' | InventoryItemType

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function matchesStockSearch(
  item: InventoryStockItem,
  rawQuery: string,
  catalogItem?: InventoryItem,
  laboratoryBreakdown?: InventoryLaboratoryStockBreakdown[],
) {
  const query = normalizeSearchText(rawQuery.trim())
  if (!query) return true

  const searchableFields = [
    item.itemName,
    catalogItem?.description ?? '',
    ...(laboratoryBreakdown?.map((entry) => entry.laboratoryName) ?? []),
  ]

  return searchableFields.some((field) => normalizeSearchText(field).includes(query))
}

function PageState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby="inventory-stock-title" className="max-w-xl">
      <h1 id="inventory-stock-title" className="text-2xl font-bold tracking-tight text-brand-navy">
        {title}
      </h1>
      {children}
    </section>
  )
}

export function InventoryStockPage() {
  const selectedGroup = useResearchGroup()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedLaboratoryId = searchParams.get('laboratoryId') || null

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilter>('ALL')
  const [inspectedItemId, setInspectedItemId] = useState<string | null>(null)

  const laboratoriesQuery = useInventoryLaboratoriesQuery(selectedGroup.id)
  const catalogQuery = useInventoryItemsQuery(selectedGroup.id)
  const stockQuery = useInventoryStockQuery(selectedGroup.id, selectedLaboratoryId)

  const laboratories = useMemo(
    () => laboratoriesQuery.data ?? [],
    [laboratoriesQuery.data],
  )
  const breakdownsQuery = useInventoryLaboratoryBreakdownsQuery(
    selectedGroup.id,
    laboratories,
  )

  useEffect(() => {
    if (stockQuery.isError) publishApiErrorToast(stockQuery.error)
  }, [stockQuery.error, stockQuery.isError])

  useEffect(() => {
    if (laboratoriesQuery.isError) publishApiErrorToast(laboratoriesQuery.error)
  }, [laboratoriesQuery.error, laboratoriesQuery.isError])

  useEffect(() => {
    if (catalogQuery.isError) publishApiErrorToast(catalogQuery.error)
  }, [catalogQuery.error, catalogQuery.isError])

  useEffect(() => {
    if (breakdownsQuery.isError) publishApiErrorToast(breakdownsQuery.error)
  }, [breakdownsQuery.error, breakdownsQuery.isError])

  const catalogById = useMemo(() => {
    const items = catalogQuery.data ?? []
    return items.reduce<Record<string, InventoryItem>>((accumulator, item) => {
      accumulator[item.id] = item
      return accumulator
    }, {})
  }, [catalogQuery.data])

  const selectedLaboratory = useMemo(
    () => laboratories.find((laboratory) => laboratory.id === selectedLaboratoryId) ?? null,
    [laboratories, selectedLaboratoryId],
  )

  function selectLaboratory(laboratoryId: string | null) {
    const nextParams = new URLSearchParams(searchParams)
    if (laboratoryId) {
      nextParams.set('laboratoryId', laboratoryId)
    } else {
      nextParams.delete('laboratoryId')
    }
    setSearchParams(nextParams, { replace: true })
  }

  if (stockQuery.isPending || laboratoriesQuery.isPending) {
    return (
      <PageState title="Saldo do estoque">
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          Carregando o saldo do estoque…
        </p>
      </PageState>
    )
  }

  if (stockQuery.isError) {
    const notFound = stockQuery.error instanceof ApiError && stockQuery.error.status === 404

    return (
      <PageState
        title={
          notFound
            ? selectedLaboratoryId
              ? 'Laboratório não encontrado'
              : 'Grupo não encontrado'
            : 'Não foi possível carregar o saldo do estoque'
        }
      >
        <p className="mt-2 text-sm text-muted-foreground">
          {notFound
            ? selectedLaboratoryId
              ? 'O laboratório selecionado não pertence a este grupo ou foi removido.'
              : 'Este grupo de pesquisa pode ter sido removido. Selecione outro grupo no menu lateral.'
            : 'Confira sua conexão e tente novamente.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {selectedLaboratoryId && notFound ? (
            <Button onClick={() => selectLaboratory(null)}>
              Ver todos os laboratórios
            </Button>
          ) : (
            !notFound && (
              <Button onClick={() => void stockQuery.refetch()}>
                Tentar novamente
              </Button>
            )
          )}
        </div>
      </PageState>
    )
  }

  const stockItems = stockQuery.data.items
  const breakdownsByItemId = breakdownsQuery.data

  const filteredItems = stockItems.filter((item) => {
    if (typeFilter !== 'ALL' && item.itemType !== typeFilter) return false

    return matchesStockSearch(
      item,
      searchQuery,
      catalogById[item.inventoryItemId],
      breakdownsByItemId?.[item.inventoryItemId],
    )
  })

  const hasLocalFilter = searchQuery.trim() !== '' || typeFilter !== 'ALL'
  const displayedTotalValue = hasLocalFilter
    ? filteredItems.reduce((sum, item) => sum + item.totalValue, 0)
    : stockQuery.data.totalValue

  const inspectedStockItem = inspectedItemId
    ? (stockItems.find((item) => item.inventoryItemId === inspectedItemId) ?? null)
    : null

  return (
    <section aria-labelledby="inventory-stock-title">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1
            id="inventory-stock-title"
            className="text-3xl font-bold tracking-tight text-brand-navy"
          >
            <span className="inline-block -rotate-1 bg-brand-yellow px-3 py-1">
              Saldo do estoque
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            Calculado a partir das entradas, saídas e transferências confirmadas. Para corrigir,
            estorne a movimentação.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
          <Button
            asChild
            size="lg"
            className="h-10 px-4 font-semibold"
          >
            <Link
              to={buildInventoryShortcutPath(selectedGroup.id, 'transferencias', {
                laboratoryId: selectedLaboratoryId,
              })}
            >
              <ArrowLeftRight aria-hidden="true" />
              Transferir
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            className="h-10 px-4 font-semibold"
          >
            <Link
              to={buildInventoryShortcutPath(selectedGroup.id, 'saidas', {
                laboratoryId: selectedLaboratoryId,
              })}
            >
              <ArrowUpFromLine aria-hidden="true" />
              Registrar saída
            </Link>
          </Button>

          <Button asChild size="lg" className="h-10 px-4 font-semibold">
            <Link
              to={buildInventoryShortcutPath(selectedGroup.id, 'entradas', {
                laboratoryId: selectedLaboratoryId,
              })}
            >
              <ArrowDownToLine aria-hidden="true" />
              Registrar entrada
            </Link>
          </Button>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filtrar saldo por laboratório"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            aria-pressed={selectedLaboratoryId === null}
            onClick={() => selectLaboratory(null)}
            className={cn(
              'inline-flex h-9 items-center rounded-full border px-4 text-xs font-semibold transition-colors',
              selectedLaboratoryId === null
                ? 'border-brand-navy bg-brand-navy text-white'
                : 'border-slate-200 bg-card text-brand-navy hover:bg-slate-100',
            )}
          >
            Todos os laboratórios
          </button>

          {laboratories.map((laboratory) => {
            const isSelected = selectedLaboratoryId === laboratory.id

            return (
              <button
                key={laboratory.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => selectLaboratory(laboratory.id)}
                className={cn(
                  'inline-flex h-9 items-center rounded-full border px-4 text-xs font-semibold transition-colors',
                  isSelected
                    ? 'border-brand-navy bg-brand-navy text-white'
                    : 'border-slate-200 bg-card text-brand-navy hover:bg-slate-100',
                )}
              >
                {laboratory.name}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div>
            <label htmlFor="inventory-stock-search" className="sr-only">
              Buscar item
            </label>
            <InputGroup className="h-10 w-full bg-card sm:w-64">
              <InputGroupAddon align="inline-start" className="pl-3">
                <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="inventory-stock-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar item"
                className="h-full text-sm"
              />
            </InputGroup>
          </div>

          <div>
            <label htmlFor="inventory-stock-type-filter" className="sr-only">
              Filtrar por tipo de item
            </label>
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as ItemTypeFilter)}
            >
              <SelectTrigger
                id="inventory-stock-type-filter"
                aria-label="Filtrar por tipo de item"
                className="h-10 w-full min-w-40 bg-card px-3 text-sm font-medium text-brand-navy sm:w-44"
              >
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os tipos</SelectItem>
                <SelectItem value="PERMANENT">Durável</SelectItem>
                <SelectItem value="CONSUMABLE">Consumo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {stockItems.length === 0 ? (
        <section
          aria-labelledby="inventory-stock-empty-title"
          className="mt-5 rounded-xl border border-dashed border-slate-200 bg-card px-6 py-12 text-center"
        >
          <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <CircleDollarSign aria-hidden="true" className="size-5" />
          </span>
          <h2 id="inventory-stock-empty-title" className="mt-4 text-base font-bold text-brand-navy">
            {selectedLaboratory
              ? `Nenhum item com saldo em ${selectedLaboratory.name}`
              : 'Nenhum item com saldo no estoque'}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {selectedLaboratory
              ? 'Registre uma entrada ou transfira materiais de outro laboratório para iniciar o saldo deste laboratório.'
              : 'Cadastre os itens no catálogo do grupo e registre a primeira entrada para apurar o saldo.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {selectedLaboratory && (
              <Button variant="outline" onClick={() => selectLaboratory(null)}>
                Ver todos os laboratórios
              </Button>
            )}
            <Button asChild variant="outline" className="font-semibold">
              <Link to={`/grupos/${selectedGroup.id}/estoque/itens`}>
                <Boxes aria-hidden="true" />
                Catálogo de itens
              </Link>
            </Button>
            <Button asChild className="font-semibold">
              <Link
                to={buildInventoryShortcutPath(selectedGroup.id, 'entradas', {
                  laboratoryId: selectedLaboratoryId,
                })}
              >
                <ArrowDownToLine aria-hidden="true" />
                Registrar entrada
              </Link>
            </Button>
          </div>
        </section>
      ) : filteredItems.length === 0 ? (
        <section
          aria-labelledby="inventory-stock-no-match-title"
          className="mt-5 rounded-xl border border-slate-200 bg-card px-6 py-10 text-center"
        >
          <h2 id="inventory-stock-no-match-title" className="text-base font-bold text-brand-navy">
            Nenhum item encontrado
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Não encontramos itens com saldo para os filtros selecionados.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery('')
              setTypeFilter('ALL')
            }}
          >
            Limpar filtros
          </Button>
        </section>
      ) : (
        <div className="mt-5">
          <div className="hidden md:block">
            <InventoryStockTable
              researchGroupId={selectedGroup.id}
              items={filteredItems}
              totalValue={displayedTotalValue}
              catalogById={catalogById}
              selectedLaboratoryId={selectedLaboratoryId}
              selectedLaboratoryName={selectedLaboratory?.name ?? null}
              breakdownsByItemId={breakdownsByItemId}
              onInspect={(item) => setInspectedItemId(item.inventoryItemId)}
            />
          </div>

          <div className="space-y-3 md:hidden">
            <ul aria-label="Itens com saldo no estoque" className="space-y-3">
              {filteredItems.map((item) => (
                <li key={item.inventoryItemId}>
                  <InventoryStockCard
                    researchGroupId={selectedGroup.id}
                    item={item}
                    catalogItem={catalogById[item.inventoryItemId]}
                    selectedLaboratoryId={selectedLaboratoryId}
                    selectedLaboratoryName={selectedLaboratory?.name ?? null}
                    laboratoryBreakdown={breakdownsByItemId?.[item.inventoryItemId]}
                    onInspect={(selected) => setInspectedItemId(selected.inventoryItemId)}
                  />
                </li>
              ))}
            </ul>

            <footer className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-brand-navy">
              <span>
                {filteredItems.length}{' '}
                {filteredItems.length === 1 ? 'item com saldo' : 'itens com saldo'}
              </span>
              <span>{formatCurrencyBRL(displayedTotalValue)}</span>
            </footer>
          </div>
        </div>
      )}

      <InventoryStockItemDetailsDialog
        researchGroupId={selectedGroup.id}
        stockItem={inspectedStockItem}
        catalogItem={
          inspectedStockItem ? catalogById[inspectedStockItem.inventoryItemId] : undefined
        }
        selectedLaboratoryId={selectedLaboratoryId}
        selectedLaboratoryName={selectedLaboratory?.name ?? null}
        laboratoryBreakdown={
          inspectedStockItem
            ? breakdownsByItemId?.[inspectedStockItem.inventoryItemId]
            : undefined
        }
        onOpenChange={(open) => {
          if (!open) setInspectedItemId(null)
        }}
      />
    </section>
  )
}
