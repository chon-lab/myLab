import { LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'

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
import { cn } from '@/lib/utils'

const navItems = [{ to: '/', label: 'Início', end: true }]

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function AppShell() {
  const { user } = useAuth()
  const logout = useLogoutMutation()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="bg-brand-navy text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-8">
          <BrandLogo className="text-lg" />

          <nav aria-label="Principal" className="flex-1">
            <ul className="flex gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white',
                        isActive && 'bg-white/10 text-white',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 gap-2 px-2 text-white hover:bg-white/10 hover:text-white"
                  aria-label={`Menu do usuário ${user.name}`}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-brand-yellow text-xs font-bold text-brand-navy">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout.mutate()}>
                  <LogOut aria-hidden="true" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  )
}
