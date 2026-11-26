import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-glow not-found-glow-one" aria-hidden="true" />
      <div className="not-found-glow not-found-glow-two" aria-hidden="true" />

      <header className="not-found-header">
        <Link href="/" className="not-found-brand" aria-label="Achado do Alê, página inicial">
          <img src="/icon.png" alt="" width="44" height="44" />
          <span>Achado <strong>do Alê</strong></span>
        </Link>
        <span className="not-found-status"><i /> página não encontrada</span>
      </header>

      <section className="not-found-content" aria-labelledby="not-found-title">
        <div className="not-found-art" aria-hidden="true">
          <div className="not-found-orbit not-found-orbit-one" />
          <div className="not-found-orbit not-found-orbit-two" />
          <span className="not-found-spark not-found-spark-one">✦</span>
          <span className="not-found-spark not-found-spark-two">✧</span>
          <span className="not-found-spark not-found-spark-three">✦</span>
          <div className="not-found-bag">
            <svg viewBox="0 0 112 112" fill="none">
              <path d="M27 39h58l5 55H22l5-55Z" fill="#F5B942" />
              <path d="M40 42V30a16 16 0 0 1 32 0v12" stroke="#07111F" strokeWidth="7" strokeLinecap="round" />
              <path d="m43 65 11 10 18-20" stroke="#07111F" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m14 26 8 5m68-12 8-6M15 83l-8 3" stroke="#F5B942" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="not-found-number">404</span>
        </div>

        <div className="not-found-copy">
          <span className="not-found-eyebrow"><span /> OPS! ESSE ACHADO SE PERDEU</span>
          <h1 id="not-found-title">Essa página saiu<br /><em>do radar.</em></h1>
          <p>O link pode estar quebrado, ter mudado de endereço ou essa oferta já não está por aqui. Mas ainda tem muito achado esperando por você.</p>
          <div className="not-found-actions">
            <Link href="/" className="not-found-primary">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m8 4-6 6 6 6M2 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Voltar para o início
            </Link>
            <Link href="/ofertas" className="not-found-secondary">Explorar ofertas <span>↗</span></Link>
          </div>
          <div className="not-found-footnote"><span>✦</span> Boas ofertas não ficam perdidas por muito tempo.</div>
        </div>
      </section>

      <footer className="not-found-footer">
        <span>ACHADO DO ALÊ</span>
        <span>Promoções, cupons e achadinhos <b>•</b> feito para economizar</span>
      </footer>
    </main>
  );
}
