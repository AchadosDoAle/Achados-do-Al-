import Link from "next/link";
import Container from "./Container";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-bg-secondary/95 backdrop-blur">
      <Container className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.png"
              alt="Achado do Alê"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="font-display text-lg font-bold tracking-tight text-text">
              Achado<span className="text-gold"> do Alê</span>
            </span>
          </Link>

          <label className="hidden flex-1 items-center gap-2 rounded-xl2 bg-card px-4 py-2.5 text-text md:flex md:max-w-md">
            <span aria-hidden="true" className="text-text-muted">
              🔎
            </span>
            <input
              type="search"
              placeholder="Buscar produtos, lojas, cupons..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
            />
          </label>

          <nav className="hidden items-center gap-6 text-sm font-medium text-text-muted md:flex">
            <Link href="/" className="hover:text-gold">
              Início
            </Link>
            <Link href="/categorias" className="hover:text-gold">
              Categorias
            </Link>
            <Link href="/favoritos" className="hover:text-gold">
              Favoritos
            </Link>
            <a
              href="https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gold px-4 py-2 text-bg hover:bg-gold-light"
            >
              Entrar no canal
            </a>
          </nav>
        </div>

        <label className="mt-3 flex items-center gap-2 rounded-xl2 bg-card px-4 py-2.5 text-text md:hidden">
          <span aria-hidden="true" className="text-text-muted">
            🔎
          </span>
          <input
            type="search"
            placeholder="Buscar produtos, lojas, cupons..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-muted"
          />
        </label>
      </Container>
    </header>
  );
}
