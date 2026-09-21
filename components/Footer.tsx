import Link from "next/link";
import Container from "./Container";
import { LINK_CANAL_WHATSAPP, REDES_SOCIAIS } from "@/lib/seo-brand";

const INSTAGRAM_ALEXANDRE = "https://www.instagram.com/alexandre_a7x/";
const LINKEDIN_ALEXANDRE = "https://www.linkedin.com/in/alexandredonascimento/";

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M6.5 8.25H3.25V20H6.5V8.25ZM4.88 3A1.88 1.88 0 1 0 4.88 6.76 1.88 1.88 0 0 0 4.88 3ZM20.75 13.26c0-3.54-1.89-5.19-4.41-5.19-2.03 0-2.94 1.12-3.45 1.9V8.25H9.64V20h3.25v-5.82c0-1.53.29-3.01 2.19-3.01 1.87 0 1.89 1.75 1.89 3.11V20h3.25l.53-6.74Z" />
    </svg>
  );
}

export default function Footer({
  destacarInstagramProjeto = false,
}: {
  destacarInstagramProjeto?: boolean;
}) {
  const instagramProjeto = REDES_SOCIAIS.find(
    (rede) => rede.nome.toLowerCase() === "instagram"
  );

  const redesRodape = destacarInstagramProjeto
    ? REDES_SOCIAIS.filter((rede) => rede.nome.toLowerCase() !== "instagram")
    : REDES_SOCIAIS;

  const links = [
    ...redesRodape,
    { nome: "WhatsApp", url: LINK_CANAL_WHATSAPP },
  ];

  return (
    <footer className="mt-6 border-t border-white/5 bg-bg-secondary px-4 py-7 text-center">
      <Container>
        {destacarInstagramProjeto && instagramProjeto && (
          <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Acompanhe o Achado do Alê
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Mais achadinhos e promoções também no Instagram.
            </p>
            <a
              href={instagramProjeto.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir Instagram do Achado do Alê"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-text transition hover:border-gold/50 hover:text-gold"
            >
              <InstagramIcon className="h-6 w-6" />
              @achados.do.ale
            </a>
          </div>
        )}

        <p className="font-display text-sm font-bold text-text">Achado do Alê</p>
        <p className="mt-1 text-xs text-text-muted">
          Promoções, cupons e achadinhos selecionados em um só lugar.
        </p>

        {links.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {links.map((link) => (
              <a
                key={`${link.nome}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-muted transition hover:border-gold/40 hover:text-gold"
              >
                {link.nome}
              </a>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs text-text-muted">
          © {new Date().getFullYear()} Achado do Alê. Ofertas sujeitas a
          disponibilidade e alteração de preço pela loja parceira.
        </p>

        <div className="mx-auto mt-4 flex max-w-xl flex-col items-center gap-2 border-t border-white/10 pt-4">
          <p className="text-[11px] text-text-muted/75">
            Desenvolvido por Alexandre do Nascimento
          </p>
          <div className="flex items-center gap-2" aria-label="Redes sociais do desenvolvedor">
            <a
              href={INSTAGRAM_ALEXANDRE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Alexandre do Nascimento"
              title="Instagram de Alexandre do Nascimento"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-muted transition hover:border-gold/40 hover:text-gold"
            >
              <InstagramIcon />
            </a>
            <a
              href={LINKEDIN_ALEXANDRE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de Alexandre do Nascimento"
              title="LinkedIn de Alexandre do Nascimento"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-muted transition hover:border-gold/40 hover:text-gold"
            >
              <LinkedinIcon />
            </a>
          </div>
        </div>

        <Link
          href="/login"
          className="mt-4 inline-block text-[11px] text-text-muted/50 hover:text-gold"
        >
          Acesso administrativo
        </Link>
      </Container>
    </footer>
  );
}
