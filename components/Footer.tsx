import Link from "next/link";
import Container from "./Container";
import AndroidAppFooterBanner from "./AndroidAppFooterBanner";
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

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3.5 20l1.2-4.4a8.2 8.2 0 1 1 15.5-3.9Z" />
      <path d="M8.6 8.1c-.4 0-.8.5-.9 1.1-.1 1.3 1.3 3.3 3.1 4.7 1.7 1.3 3.3 1.6 3.9 1.2l.8-1.2-2-1-1 1.1c-1.3-.6-2.4-1.7-3-2.9l1-1-1-2.1Z" />
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

function PortfolioIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13a19 19 0 0 0 18 0M10 12.5h4" />
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

  // No destaque da Home, Instagram e WhatsApp dividem o mesmo bloco.
  // Os demais links sociais continuam abaixo, se estiverem configurados.
  const links = destacarInstagramProjeto && instagramProjeto
    ? redesRodape
    : [...redesRodape, { nome: "WhatsApp", url: LINK_CANAL_WHATSAPP }];

  return (
    <>
    <footer className="mt-6 border-t border-white/5 bg-bg-secondary px-4 py-7 text-center">
      <Container>
        {destacarInstagramProjeto && instagramProjeto && (
          <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              Acompanhe o Achado do Alê
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Novidades, achadinhos e promoções no Instagram e no WhatsApp.
            </p>
            <div className="mx-auto mt-4 grid w-full max-w-[390px] grid-cols-2 gap-2 sm:gap-3">
              <a
                href={instagramProjeto.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Acompanhar Achados do Alê no Instagram"
                className="btn-modern inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-text transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <InstagramIcon className="h-5 w-5 shrink-0" />
                <span>Instagram</span>
              </a>
              <a
                href={LINK_CANAL_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Acompanhar Achados do Alê no canal do WhatsApp"
                className="btn-modern inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-text transition-colors hover:border-gold/50 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <WhatsAppIcon className="h-5 w-5 shrink-0" />
                <span>WhatsApp</span>
              </a>
            </div>
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
                className="btn-modern rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-text-muted hover:border-gold/40 hover:text-gold"
              >
                {link.nome}
              </a>
            ))}
          </div>
        )}

        {/* Links oficiais dos aplicativos, sempre presentes no rodapé público. */}
        <section aria-labelledby="apps-download-title" className="mx-auto mt-7 hidden max-w-[620px] rounded-[22px] md:block border border-white/10 bg-[#102640] px-4 py-5 shadow-[0_10px_32px_rgba(0,0,0,.16)] sm:px-6">
          <p id="apps-download-title" className="font-display text-base font-bold text-white">
            Leve os achados com você
          </p>
          <p className="mt-1 text-xs text-[#a9bed6]">
            Baixe o aplicativo ou acompanhe a chegada da versão para iPhone.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://play.google.com/store/apps/details?id=com.achadodoale.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Baixar o Achados do Alê para Android na Google Play"
              className="inline-flex min-h-[48px] min-w-[156px] items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-[#07111f] shadow-[0_4px_16px_rgba(245,185,66,.12)] transition-colors duration-200 hover:bg-[#ffd16b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 9a7 7 0 0 1 14 0M5 10v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7H5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m7 4-2-2m12 2 2-2M9 14h.01M15 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Baixar Android</span>
            </a>
            <Link
              href="/app/ios"
              aria-label="Ver quando o aplicativo Achados do Alê para iOS estará disponível"
              className="inline-flex min-h-[48px] min-w-[156px] items-center justify-center gap-2 rounded-xl border border-[#6885a4]/55 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition-colors duration-200 hover:border-gold/60 hover:bg-white/[0.11] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="6" y="2" width="12" height="20" rx="2.7" stroke="currentColor" strokeWidth="1.7" />
                <path d="M10 5h4M11.5 19h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span>App para iOS</span>
            </Link>
          </div>
        </section>

        <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-text-muted">
          <Link href="/sobre" className="nav-link-modern">Sobre</Link>
          <Link href="/afiliados" className="nav-link-modern">Afiliados</Link>
          <Link href="/privacidade" className="nav-link-modern">Privacidade</Link>
          <Link href="/excluir-conta" className="nav-link-modern">Excluir conta</Link>
          <Link href="/termos" className="nav-link-modern">Termos de Uso</Link>
          <Link href="/perdeu" className="nav-link-modern text-gold/80">Veja o que já perdeu!</Link>
        </div>
        <p className="mt-4 text-xs text-text-muted">
          © {new Date().getFullYear()} Achado do Alê. Ofertas sujeitas a
          disponibilidade e alteração de preço pela loja parceira.
        </p>

        <div className="mx-auto mt-4 flex max-w-xl flex-col items-center gap-2 border-t border-white/10 pt-4">
          <p className="text-[11px] text-text-muted/75">
            Desenvolvido por{" "}
            <a
              href="https://anascimento.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-text-muted underline decoration-white/20 underline-offset-4 transition-colors hover:text-gold hover:decoration-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              title="Conheça o portfólio de Alexandre do Nascimento"
            >
              Alexandre do Nascimento
            </a>
          </p>
          <div className="flex items-center gap-2" aria-label="Redes sociais do desenvolvedor">
            <a
              href="https://anascimento.dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Portfólio profissional de Alexandre do Nascimento"
              title="Portfólio — anascimento.dev"
              className="btn-icon-modern inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-muted hover:border-gold/40 hover:text-gold"
            >
              <PortfolioIcon />
            </a>
            <a
              href={INSTAGRAM_ALEXANDRE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de Alexandre do Nascimento"
              title="Instagram de Alexandre do Nascimento"
              className="btn-icon-modern inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-muted hover:border-gold/40 hover:text-gold"
            >
              <InstagramIcon />
            </a>
            <a
              href={LINKEDIN_ALEXANDRE}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn de Alexandre do Nascimento"
              title="LinkedIn de Alexandre do Nascimento"
              className="btn-icon-modern inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-muted hover:border-gold/40 hover:text-gold"
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
    <AndroidAppFooterBanner />
    </>
  );
}
