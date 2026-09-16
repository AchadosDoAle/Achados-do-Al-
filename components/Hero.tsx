import Container from "./Container";

export default function Hero() {
  return (
    <section className="bg-bg-secondary px-4 pb-6 pt-6">
      <Container className="md:flex md:items-center md:justify-between md:gap-10">
        <div className="md:max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            Bem-vindo ao Achado do Alê
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-text md:text-4xl">
            Achadinhos que
            <br />
            <span className="text-gold">valem a pena</span>
          </h1>
          <p className="mt-2 text-sm text-text-muted md:text-base">
            Ofertas, cupons e oportunidades selecionadas para você
            economizar de verdade.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-text-muted">
            <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5">
              ✓ Ofertas conferidas
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5">
              🏷️ Cupons exclusivos
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5">
              ⚡ Economia real
            </span>
          </div>
        </div>

        <svg
          viewBox="0 0 320 110"
          className="mx-auto mt-5 hidden h-28 w-72 shrink-0 md:block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(90,10) rotate(-12)">
            <rect x="0" y="0" width="60" height="60" rx="14" fill="#F5B942" />
            <circle cx="16" cy="16" r="5" fill="#07111F" />
            <text
              x="30"
              y="42"
              fontSize="26"
              fontWeight="700"
              fill="#07111F"
              textAnchor="middle"
            >
              %
            </text>
          </g>
          <path
            d="M170 25 q18 -10 32 2"
            stroke="#FFD66B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M175 45 q22 -4 34 14"
            stroke="#2FBF8F"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="235" cy="20" r="4" fill="#F5B942" />
          <circle cx="250" cy="55" r="3" fill="#FFD66B" />
        </svg>
      </Container>
    </section>
  );
}
