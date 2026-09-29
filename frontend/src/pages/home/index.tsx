import { useAuth } from '@/queries/auth/use-auth'

export function HomePage() {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0]

  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title" className="text-2xl font-bold tracking-tight">
        Olá{firstName ? `, ${firstName}` : ''}!
      </h1>
      <p className="mt-2 text-muted-foreground">
        Em breve: laboratórios, projetos, membros e estoque do seu grupo de pesquisa.
      </p>
    </section>
  )
}
