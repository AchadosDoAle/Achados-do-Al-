"use client";

const ICONE_POR_CATEGORIA: Record<string, string> = { Todos: "▦", Casa: "⌂", Beleza: "✿", Tecnologia: "▣", Moda: "◇", Ferramentas: "⌕", Infantil: "♧" };

export default function CategoryChips({ categorias, selecionada, onSelecionar }: { categorias: string[]; selecionada: string; onSelecionar: (categoria: string) => void }) {
  return <div className="flex gap-3 overflow-x-auto pb-2">{categorias.map((categoria) => { const ativa = categoria === selecionada; return <button key={categoria} type="button" onClick={() => onSelecionar(categoria)} className={`flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold ${ativa ? "border-[#f5b942] bg-[#f5b942] text-[#07111f]" : "border-[#f5b942]/25 bg-[#10243a] text-slate-200"}`}><span>{ICONE_POR_CATEGORIA[categoria] ?? "◇"}</span>{categoria}</button>; })}</div>;
}
