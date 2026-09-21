import Link from "next/link";
import Container from "./Container";
import { LINK_CANAL_WHATSAPP, REDES_SOCIAIS } from "@/lib/seo-brand";

export default function Footer() {
  const links = [
    ...REDES_SOCIAIS,
    { nome: "WhatsApp", url: LINK_CANAL_WHATSAPP },
  ];

  return (
    <footer className="mt-6 border-t border-white/5 bg-bg-secondary px-4 py-6 text-center">
      <Container>
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
        <Link
          href="/login"
          className="mt-3 inline-block text-[11px] text-text-muted/60 hover:text-gold"
        >
          Acesso administrativo
        </Link>
      </Container>
    </footer>
  );
}
