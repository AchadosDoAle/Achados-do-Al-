"use client";

type PaginacaoProps = {
  paginaAtual: number;
  totalItens: number;
  itensPorPagina: number;
  onChange: (pagina: number) => void;
  carregando?: boolean;
};

function paginasVisiveis(paginaAtual: number, totalPaginas: number) {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }

  const paginas: Array<number | "inicio" | "fim"> = [1];

  if (paginaAtual > 4) paginas.push("inicio");

  const inicio = Math.max(2, paginaAtual - 1);
  const fim = Math.min(totalPaginas - 1, paginaAtual + 1);
  for (let pagina = inicio; pagina <= fim; pagina += 1) paginas.push(pagina);

  if (paginaAtual < totalPaginas - 3) paginas.push("fim");
  paginas.push(totalPaginas);

  return paginas;
}

export default function Paginacao({
  paginaAtual,
  totalItens,
  itensPorPagina,
  onChange,
  carregando = false,
}: PaginacaoProps) {
  if (totalItens <= 0) return null;

  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
  const inicio = (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);
  const paginas = paginasVisiveis(paginaAtual, totalPaginas);

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-[18px] border border-brand/10 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-ink/55 sm:text-sm">
        Mostrando <strong>{inicio}–{fim}</strong> de <strong>{totalItens}</strong>
        {totalPaginas > 1 ? ` · Página ${paginaAtual} de ${totalPaginas}` : ""}
      </p>

      {totalPaginas > 1 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={paginaAtual <= 1 || carregando}
            onClick={() => onChange(paginaAtual - 1)}
            className="admin-action-soft rounded-xl border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Anterior
          </button>

          <div className="hidden items-center gap-1.5 sm:flex">
            {paginas.map((pagina, indice) => {
              if (pagina === "inicio" || pagina === "fim") {
                return (
                  <span key={`${pagina}-${indice}`} className="px-1 text-xs text-ink/40">
                    …
                  </span>
                );
              }

              const ativa = pagina === paginaAtual;
              return (
                <button
                  type="button"
                  key={pagina}
                  disabled={carregando}
                  onClick={() => onChange(pagina)}
                  aria-current={ativa ? "page" : undefined}
                  className={
                    ativa
                      ? "admin-action min-w-9 rounded-xl border px-3 py-2 text-xs font-bold"
                      : "admin-action-soft min-w-9 rounded-xl border px-3 py-2 text-xs font-semibold"
                  }
                >
                  {pagina}
                </button>
              );
            })}
          </div>

          <span className="px-2 text-xs font-semibold text-ink/60 sm:hidden">
            {paginaAtual}/{totalPaginas}
          </span>

          <button
            type="button"
            disabled={paginaAtual >= totalPaginas || carregando}
            onClick={() => onChange(paginaAtual + 1)}
            className="admin-action-soft rounded-xl border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
