import { BrandLogo } from '@/components/brand-logo'

export function LoginBrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy px-16 py-14 text-white lg:flex">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-8 bg-white/5" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-6 bg-white/5" />
      <header className="relative">
        <BrandLogo />
      </header>

      <section aria-labelledby="login-tagline" className="relative max-w-xl">
        <h2
          id="login-tagline"
          className="text-5xl leading-[1.12] font-bold tracking-tight"
        >
          <mark className="inline-block rotate-[-0.7deg] bg-brand-yellow px-3 text-brand-navy">Saiba o que tem</mark>
          <span className="mt-3 block">no estoque, onde está e para qual projeto foi usado.</span>
        </h2>
        <p className="mt-8 text-lg leading-relaxed text-white/80">
          Laboratórios, projetos, membros e estoque do seu grupo de pesquisa, organizados no
          mesmo lugar.
        </p>
      </section>

      <footer className="relative text-sm text-white/60">
        <p>LabSens, Instituto de Química, Universidade Federal Modelo</p>
      </footer>
    </aside>
  )
}
