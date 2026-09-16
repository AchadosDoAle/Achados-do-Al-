import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-white/5 bg-bg-secondary px-4 py-6 text-center">
      <Container>
        <p className="text-xs text-text-muted">
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
