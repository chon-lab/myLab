import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
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
  Plus,
  ShieldCheck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";

import { BrandLogo } from "@/components/brand-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeaveGroupDialog } from "@/components/layout/leave-group-dialog";
import { NotificationsBell } from "@/components/layout/notifications-bell";
import { setSelectedResearchGroupId } from "@/components/layout/selected-research-group-storage";
import { useLogoutMutation } from "@/queries/auth/auth.queries";
import { useAuth } from "@/queries/auth/use-auth";
import { usePermissions } from "@/queries/permissions/permissions.queries";
import type { ResearchGroup } from "@/types/research-groups/research-group.types";
import type { PermissionResource } from "@/types/permissions/permission.types";
import { cn } from "@/lib/utils";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  resource?: PermissionResource;
};

const groupNavigation: NavItem[] = [
  { path: "painel", label: "Painel", icon: Gauge },
  {
    path: "dados-do-grupo",
    label: "Dados do grupo",
    icon: Building2,
    resource: "RESEARCH_GROUP",
  },
  {
    path: "linhas-de-pesquisa",
    label: "Linhas de pesquisa",
    icon: Layers3,
    resource: "RESEARCH_LINE",
  },
  { path: "membros", label: "Membros", icon: UsersRound, resource: "MEMBER" },
  { path: "cargos", label: "Cargos", icon: ShieldCheck, resource: "ROLE" },
  {
    path: "laboratorios",
    label: "Laboratórios",
    icon: Laptop,
    resource: "LABORATORY",
  },
  {
    path: "projetos",
    label: "Projetos",
    icon: FolderKanban,
    resource: "PROJECT",
  },
];

const inventoryNavigation: NavItem[] = [
  {
    path: "estoque/saldo",
    label: "Saldo",
    icon: CircleDollarSign,
    resource: "INVENTORY_STOCK",
  },
  {
    path: "estoque/itens",
    label: "Itens",
    icon: Boxes,
    resource: "INVENTORY_ITEM",
  },
  {
    path: "estoque/entradas",
    label: "Entradas",
    icon: ArrowDownToLine,
    resource: "INVENTORY_ENTRY",
  },
  {
    path: "estoque/saidas",
    label: "Saídas",
    icon: ArrowUpFromLine,
    resource: "INVENTORY_EXIT",
  },
  {
    path: "estoque/transferencias",
    label: "Transferências",
    icon: ArrowLeftRight,
    resource: "INVENTORY_TRANSFER",
  },
];

const navigationItems = [...groupNavigation, ...inventoryNavigation];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function SidebarNavigation({
  groups,
  selectedGroup,
  onSelectGroup,
  onLogout,
  onNavigate,
}: {
  groups: ResearchGroup[];
  selectedGroup: ResearchGroup | null;
  onSelectGroup: (group: ResearchGroup) => void;
  onLogout: () => void;
  onNavigate: () => void;
}) {
  const { user } = useAuth();
  const { researchGroupId } = useParams();
  const navigate = useNavigate();
  const basePath = `/grupos/${researchGroupId}`;
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  function goToCreateGroup() {
    onNavigate();
    navigate("/novo-grupo");
  }

  return (
    <>
      <div className="border-b border-white/10 px-5 py-4">
        <BrandLogo className="text-[1.35rem]" />
        {groups.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="mt-4 h-auto w-full justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-left text-white hover:bg-white/10 hover:text-white"
                aria-label={
                  selectedGroup
                    ? `Grupo selecionado: ${selectedGroup.name}. Trocar grupo`
                    : "Selecionar grupo"
                }
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-yellow text-sm font-bold text-brand-navy">
                    {selectedGroup ? initials(selectedGroup.name) : "+"}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {selectedGroup ? selectedGroup.name : "Selecionar grupo"}
                    </span>
                    <span className="block truncate text-xs text-white/55">
                      {selectedGroup
                        ? selectedGroup.institutionName ||
                          selectedGroup.institutionUnit
                        : "Novo grupo em andamento"}
                    </span>
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-white/60"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Grupos de pesquisa</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onSelect={() => {
                    onNavigate();
                    onSelectGroup(group);
                  }}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-yellow/30 text-xs font-bold text-brand-navy">
                    {initials(group.name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{group.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={goToCreateGroup}>
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-slate-100 text-brand-navy">
                  <Plus aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  Criar novo grupo de pesquisa
                </span>
              </DropdownMenuItem>
              {selectedGroup && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => setLeaveDialogOpen(true)}
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-destructive/10 text-destructive">
                      <LogOut aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      Sair do grupo
                    </span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <p className="mt-4 rounded-xl bg-white/5 px-3 py-2.5 text-xs leading-relaxed text-white/55">
            Você ainda não participa de nenhum grupo de pesquisa.
          </p>
        )}
      </div>

      <nav
        aria-label="Navegação do grupo"
        className="min-h-0 flex-1 overflow-hidden px-3 py-3"
      >
        {selectedGroup ? (
          <GatedNavigation basePath={basePath} onNavigate={onNavigate} />
        ) : (
          <DisabledNavigation />
        )}
      </nav>

      {user && (
        <footer className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <Avatar className="size-9 border border-white/10">
              <AvatarFallback className="bg-brand-navy-soft text-xs font-bold text-white">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">
                {user.name}
              </span>
              {selectedGroup ? (
                <UserRoleLabel />
              ) : (
                <span className="block truncate text-xs text-white/50">
                  Sem grupo
                </span>
              )}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Sair da conta"
              onClick={() => {
                onNavigate();
                onLogout();
              }}
            >
              <LogOut aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </footer>
      )}
      <LeaveGroupDialog
        group={leaveDialogOpen ? selectedGroup : null}
        onOpenChange={(open) => setLeaveDialogOpen(open)}
        onLeft={() => {
          setLeaveDialogOpen(false);
          onNavigate();
          navigate("/");
        }}
      />
    </>
  );
}

function SidebarLink({
  item,
  basePath,
  onNavigate,
}: {
  item: (typeof navigationItems)[number];
  basePath: string;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <NavItemLink
      to={`${basePath}/${item.path}`}
      label={item.label}
      icon={<Icon aria-hidden="true" className="size-[1.05rem]" />}
      onNavigate={onNavigate}
    />
  );
}

function NavItemLink({
  to,
  label,
  icon,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "relative text-white/65 transition-colors hover:bg-white/5 hover:text-white",
          navItemBaseClass,
          isActive && "bg-white/10 text-white",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute inset-y-2 left-0 w-0.5 rounded-r bg-brand-yellow"
            />
          )}
          {icon}
          {label}
        </>
      )}
    </NavLink>
  );
}

const navSectionHeadingClass =
  "px-3 pb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/40";
const navListClass = "space-y-1";
const navItemBaseClass =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium";

function GatedNavigation({
  basePath,
  onNavigate,
}: {
  basePath: string;
  onNavigate: () => void;
}) {
  const { can } = usePermissions();

  const visibleGroupNavigation = groupNavigation.filter(
    (item) => !item.resource || can(item.resource, "READ"),
  );
  const visibleInventoryNavigation = inventoryNavigation.filter(
    (item) => !item.resource || can(item.resource, "READ"),
  );

  return (
    <>
      <p className={navSectionHeadingClass}>Grupo</p>
      <ul className={navListClass}>
        {visibleGroupNavigation.map((item) => (
          <li key={item.path}>
            <SidebarLink
              item={item}
              basePath={basePath}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>

      {visibleInventoryNavigation.length > 0 && (
        <>
          <p className={cn("mt-4", navSectionHeadingClass)}>Estoque</p>
          <ul className={navListClass}>
            {visibleInventoryNavigation.map((item) => (
              <li key={item.path}>
                <SidebarLink
                  item={item}
                  basePath={basePath}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function DisabledNavigation() {
  return (
    <>
      <p className={navSectionHeadingClass}>Grupo</p>
      <ul className={navListClass}>
        {groupNavigation.map((item) => (
          <li key={item.path}>
            <DisabledNavItem item={item} />
          </li>
        ))}
      </ul>

      <p className={cn("mt-4", navSectionHeadingClass)}>Estoque</p>
      <ul className={navListClass}>
        {inventoryNavigation.map((item) => (
          <li key={item.path}>
            <DisabledNavItem item={item} />
          </li>
        ))}
      </ul>
    </>
  );
}

function UserRoleLabel() {
  const { roleName } = usePermissions();

  return (
    <span className="block truncate text-xs text-white/50">
      {roleName ?? "Membro"}
    </span>
  );
}

function DisabledNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <span
      aria-disabled="true"
      className={cn(navItemBaseClass, "cursor-not-allowed text-white/25")}
    >
      <Icon aria-hidden="true" className="size-[1.05rem]" />
      {item.label}
    </span>
  );
}

export function AppShell({
  groups,
  selectedGroup,
  children,
}: {
  groups: ResearchGroup[];
  selectedGroup: ResearchGroup | null;
  children?: ReactNode;
}) {
  const { user } = useAuth();
  const logout = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const { researchGroupId } = useParams();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const currentItem = navigationItems.find((item) =>
    location.pathname.endsWith(`/${item.path}`),
  );
  const pageTitle = selectedGroup
    ? (currentItem?.label ?? "Painel")
    : "Começar";

  function selectGroup(group: ResearchGroup) {
    setSelectedResearchGroupId(group.id);

    const target =
      researchGroupId &&
      location.pathname.includes(`/grupos/${researchGroupId}`)
        ? location.pathname.replace(
            `/grupos/${researchGroupId}`,
            `/grupos/${group.id}`,
          )
        : `/grupos/${group.id}/painel`;

    navigate(target);
  }

  return (
    <DialogPrimitive.Root
      open={mobileSidebarOpen}
      onOpenChange={setMobileSidebarOpen}
    >
      <div className="min-h-svh bg-slate-50 lg:flex lg:h-svh lg:overflow-hidden">
        <aside className="hidden w-68 shrink-0 flex-col overflow-hidden bg-brand-navy text-white lg:flex lg:h-svh lg:min-h-0">
          <SidebarNavigation
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={selectGroup}
            onLogout={() => logout.mutate()}
            onNavigate={() => {}}
          />
        </aside>

        <div className="flex min-h-svh min-w-0 flex-1 flex-col lg:min-h-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
            <div className="flex min-h-18 items-center justify-between gap-4 px-4 sm:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <DialogPrimitive.Trigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10 border-slate-200 text-brand-navy lg:hidden"
                    aria-label="Abrir navegação"
                    aria-expanded={mobileSidebarOpen}
                    aria-controls="mobile-sidebar"
                  >
                    <Menu aria-hidden="true" className="size-5" />
                  </Button>
                </DialogPrimitive.Trigger>
                <DialogPrimitive.Portal>
                  <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/30 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
                  <DialogPrimitive.Content
                    id="mobile-sidebar"
                    className="fixed inset-y-0 left-0 z-50 flex h-svh w-68 max-w-[calc(100%-2rem)] flex-col overflow-hidden bg-brand-navy text-white shadow-2xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden"
                  >
                    <DialogPrimitive.Title className="sr-only">
                      Navegação do myLab
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Close asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Fechar navegação"
                        className="absolute right-3 top-3 z-10 text-white/70 hover:bg-white/10 hover:text-white"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </Button>
                    </DialogPrimitive.Close>
                    <SidebarNavigation
                      groups={groups}
                      selectedGroup={selectedGroup}
                      onSelectGroup={selectGroup}
                      onLogout={() => logout.mutate()}
                      onNavigate={() => setMobileSidebarOpen(false)}
                    />
                  </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
                <nav
                  aria-label="Trilha de navegação"
                  className="flex min-w-0 items-center gap-2 text-sm"
                >
                  {selectedGroup && (
                    <>
                      <span className="hidden text-muted-foreground sm:inline">
                        {selectedGroup.name}
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className="hidden size-4 text-slate-300 sm:inline"
                      />
                    </>
                  )}
                  {currentItem?.path.startsWith("estoque/") && (
                    <>
                      <span className="hidden text-muted-foreground sm:inline">
                        Estoque
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className="hidden size-4 text-slate-300 sm:inline"
                      />
                    </>
                  )}
                  <span
                    className="truncate font-semibold text-brand-navy"
                    aria-current="page"
                  >
                    {pageTitle}
                  </span>
                </nav>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                <NotificationsBell />
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

          <main
            className={cn(
              "flex-1 px-4 py-7 sm:px-8 sm:py-9 lg:min-h-0 lg:overflow-y-auto",
              currentItem?.path === "dados-do-grupo" && "sm:py-4",
            )}
          >
            <div className="mx-auto w-full max-w-360">
              {children ?? <Outlet />}
            </div>
          </main>
        </div>
      </div>
    </DialogPrimitive.Root>
  );
}
