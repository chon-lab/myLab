import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Bell,
  Boxes,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  FolderKanban,
  Gauge,
  Layers3,
  Laptop,
  LogOut,
  Menu,
  Search,
  UsersRound,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router'

import { BrandLogo } from '@/components/brand-logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogoutMutation } from '@/queries/auth/auth.queries'
import { useAuth } from '@/queries/auth/use-auth'
import type { ResearchGroup } from '@/types/research-groups/research-group.types'
import { cn } from '@/lib/utils'

const groupNavigation = [
  { path: 'painel', label: 'Painel', icon: Gauge },
  { path: 'dados-do-grupo', label: 'Dados do grupo', icon: Building2 },
  { path: 'linhas-de-pesquisa', label: 'Linhas de pesquisa', icon: Layers3 },
  { path: 'membros', label: 'Membros', icon: UsersRound },
  { path: 'laboratorios', label: 'Laboratórios', icon: Laptop },
  { path: 'projetos', label: 'Projetos', icon: FolderKanban },
]

const inventoryNavigation = [
  { path: 'estoque/saldo', label: 'Saldo', icon: CircleDollarSign },
  { path: 'estoque/itens', label: 'Itens', icon: Boxes },
  { path: 'estoque/entradas', label: 'Entradas', icon: ArrowDownToLine },
  { path: 'estoque/saidas', label: 'Saídas', icon: ArrowUpFromLine },
  { path: 'estoque/transferencias', label: 'Transferências', icon: ArrowLeftRight },
]

const navigationItems = [...groupNavigation, ...inventoryNavigation]
const selectedGroupStorageKey = 'mylab:selected-research-group'

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function SidebarNavigation({
  groups,
  selectedGroup,
  onSelectGroup,
  onLogout,
}: {
  groups: ResearchGroup[]
  selectedGroup: ResearchGroup
  onSelectGroup: (group: ResearchGroup) => void
  onLogout: () => void
}) {
  const { user } = useAuth()
  const { researchGroupId } = useParams()
  const basePath = `/grupos/${researchGroupId}`

  return (
    <>
      <div className="border-b border-white/10 px-6 py-6 [@media(max-height:760px)]:py-3">
        <BrandLogo className="text-[1.35rem]" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="mt-7 h-auto w-full justify-between gap-3 rounded-xl bg-white/5 px-3 py-3 text-left text-white hover:bg-white/10 hover:text-white [@media(max-height:760px)]:mt-3 [@media(max-height:760px)]:py-2"
              aria-label={`Grupo selecionado: ${selectedGroup.name}. Trocar grupo`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-yellow text-sm font-bold text-brand-navy">
                  {initials(selectedGroup.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{selectedGroup.name}</span>
                  <span className="block truncate text-xs text-white/55">
                    {selectedGroup.institutionName || selectedGroup.institutionUnit}
                  </span>
                </span>
              </span>
              <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-white/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Grupos de pesquisa</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {groups.map((group) => (
              <DropdownMenuItem key={group.id} onSelect={() => onSelectGroup(group)}>
                <span className="grid size-7 place-items-center rounded-md bg-brand-yellow/30 text-xs font-bold text-brand-navy">
                  {initials(group.name)}
                </span>
                <span className="truncate">{group.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav aria-label="Navegação do grupo" className="min-h-0 flex-1 overflow-y-auto px-4 py-5 [@media(max-height:760px)]:py-2">
        <p className="px-3 pb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/40">
          Grupo
        </p>
        <ul className="space-y-1">
          {groupNavigation.map((item) => (
            <li key={item.path}>
              <SidebarLink item={item} basePath={basePath} />
            </li>
          ))}
        </ul>

        <p className="mt-7 px-3 pb-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/40 [@media(max-height:760px)]:mt-3">
          Estoque
        </p>
        <ul className="space-y-1">
          {inventoryNavigation.map((item) => (
            <li key={item.path}>
              <SidebarLink item={item} basePath={basePath} />
            </li>
          ))}
        </ul>
      </nav>

      {user && (
        <footer className="border-t border-white/10 p-4 [@media(max-height:760px)]:p-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="size-10 border border-white/10">
              <AvatarFallback className="bg-brand-navy-soft text-xs font-bold text-white">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{user.name}</span>
              <span className="block truncate text-xs text-white/50">Pesquisador</span>
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Sair da conta"
              onClick={onLogout}
            >
              <LogOut aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </footer>
      )}
    </>
  )
}

function SidebarLink({ item, basePath }: {
  item: (typeof navigationItems)[number]
  basePath: string
}) {
  const Icon = item.icon

  return (
    <NavItemLink to={`${basePath}/${item.path}`} label={item.label} icon={<Icon aria-hidden="true" className="size-[1.05rem]" />} />
  )
}

function NavItemLink({ to, label, icon }: { to: string; label: string; icon: ReactNode }) {
  return (
    <NavLink to={to} className={({ isActive }) => cn(
      'relative flex min-h-10 items-center gap-3 rounded-lg px-3 text-[0.82rem] font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white [@media(max-height:760px)]:min-h-8',
      isActive && 'bg-white/10 text-white',
    )}>
      {({ isActive }) => (
        <>
          {isActive && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-r bg-brand-yellow" />}
          {icon}
          {label}
        </>
      )}
    </NavLink>
  )
}

export function AppShell({
  groups,
  selectedGroup,
}: {
  groups: ResearchGroup[]
  selectedGroup: ResearchGroup
}) {
  const { user } = useAuth()
  const logout = useLogoutMutation()
  const navigate = useNavigate()
  const location = useLocation()
  const { researchGroupId } = useParams()
  const currentItem = navigationItems.find((item) => location.pathname.endsWith(`/${item.path}`))
  const pageTitle = currentItem?.label ?? 'Painel'

  function selectGroup(group: ResearchGroup) {
    try {
      window.localStorage.setItem(selectedGroupStorageKey, group.id)
    } catch {
      return navigate(location.pathname.replace(`/grupos/${researchGroupId}`, `/grupos/${group.id}`))
    }
    navigate(location.pathname.replace(`/grupos/${researchGroupId}`, `/grupos/${group.id}`))
  }

  return (
    <div className="min-h-svh bg-slate-50 lg:flex lg:h-svh lg:overflow-hidden">
      <aside className="hidden w-[17rem] shrink-0 flex-col bg-brand-navy text-white lg:flex lg:min-h-0">
        <SidebarNavigation
          groups={groups}
          selectedGroup={selectedGroup}
          onSelectGroup={selectGroup}
          onLogout={() => logout.mutate()}
        />
      </aside>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col lg:min-h-0">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="flex min-h-[4.5rem] items-center justify-between gap-4 px-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <details className="group relative lg:hidden">
                <summary className="grid size-10 list-none place-items-center rounded-lg border border-slate-200 text-brand-navy [&::-webkit-details-marker]:hidden">
                  <Menu aria-hidden="true" className="size-5" />
                  <span className="sr-only">Abrir navegação</span>
                </summary>
                <aside className="absolute left-0 top-12 z-30 flex max-h-[calc(100svh-5rem)] w-[17rem] flex-col overflow-y-auto rounded-xl bg-brand-navy text-white shadow-xl">
                  <SidebarNavigation
                    groups={groups}
                    selectedGroup={selectedGroup}
                    onSelectGroup={selectGroup}
                    onLogout={() => logout.mutate()}
                  />
                </aside>
              </details>
              <nav aria-label="Trilha de navegação" className="flex min-w-0 items-center gap-2 text-sm">
                <span className="hidden text-muted-foreground sm:inline">{selectedGroup.name}</span>
                <ChevronRight aria-hidden="true" className="hidden size-4 text-slate-300 sm:inline" />
                <span className="truncate font-semibold text-brand-navy" aria-current="page">{pageTitle}</span>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div aria-hidden="true" className="hidden h-10 w-64 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-muted-foreground xl:flex">
                <Search className="size-4" />
                <span className="flex-1">Buscar no myLab</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled
                aria-label="Notificações indisponíveis"
                className="relative size-10 text-slate-500"
              >
                <Bell aria-hidden="true" className="size-5" />
              </Button>
              {user && (
                <Avatar className="size-9 lg:hidden">
                  <AvatarFallback className="bg-brand-yellow text-xs font-bold text-brand-navy">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </header>

        <main className={cn('flex-1 px-4 py-7 sm:px-8 sm:py-9 lg:min-h-0 lg:overflow-y-auto', currentItem?.path === 'dados-do-grupo' && 'sm:py-4')}>
          <div className="mx-auto w-full max-w-[90rem]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
