import { BrandLogo } from '@/components/brand-logo'

export function LoginBrandPanel() {
  return (
    <aside className="hidden flex-col justify-between bg-brand-navy px-16 py-14 text-white lg:flex">
      <header>
        <BrandLogo />
      </header>

      <section aria-labelledby="login-tagline" className="max-w-xl">
        <h2
          id="login-tagline"
          className="text-5xl leading-[1.12] font-bold tracking-tight"
        >
          <mark className="bg-brand-yellow px-3 text-brand-navy">Saiba o que tem</mark>
          <span className="mt-3 block">no estoque, onde está e para qual projeto foi usado.</span>
        </h2>
        <p className="mt-8 text-lg leading-relaxed text-white/80">
          Laboratórios, projetos, membros e estoque do seu grupo de pesquisa, organizados no
          mesmo lugar.
        </p>
      </section>

      <footer className="text-sm text-white/60">
        <p>LabSens, Instituto de Química, Universidade Federal Modelo</p>
      </footer>
    </aside>
  )
}
