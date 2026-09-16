export default function Hero() {
  return (
    <section className="bg-cream px-4 pb-5 pt-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand/70">
        Bem-vindo ao
      </p>
      <h1 className="mt-1 font-display text-3xl font-bold leading-tight text-ink">
        Achadinhos que
        <br />
        <span className="text-accent">valem a pena</span>
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Ofertas e cupons selecionados todos os dias.
      </p>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-ink/70">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">🛡️</span> Ofertas conferidas
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">🏷️</span> Cupons exclusivos
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">⚡</span> Economia de verdade
        </span>
      </div>

      <svg
        viewBox="0 0 320 110"
        className="mx-auto mt-4 h-24 w-full max-w-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(90,10) rotate(-12)">
          <rect
            x="0"
            y="0"
            width="60"
            height="60"
            rx="14"
            fill="#FF4F81"
          />
          <circle cx="16" cy="16" r="5" fill="#FFF9F2" />
          <text
            x="30"
            y="42"
            fontSize="26"
            fontWeight="700"
            fill="#FFF9F2"
            textAnchor="middle"
          >
            %
          </text>
        </g>
        <path
          d="M170 25 q18 -10 32 2"
          stroke="#3D1E6D"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M175 45 q22 -4 34 14"
          stroke="#FFC93C"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="235" cy="20" r="4" fill="#1F9D82" />
        <circle cx="250" cy="55" r="3" fill="#FF4F81" />
      </svg>
    </section>
  );
}
