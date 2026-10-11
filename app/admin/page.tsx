"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listarOfertas } from "@/lib/offers-repo";
import { listarCuponsParaBuscaAdmin, cupomExpirado } from "@/lib/coupons-repo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import type { Oferta, Cupom } from "@/lib/types";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

const atalhos = [
  { href: "/admin/ofertas/nova", icone: "＋", titulo: "Publicar oferta", detalhe: "Cadastrar uma promoção", destaque: true },
  { href: "/admin/cupons/novo", icone: "🎟", titulo: "Publicar cupom", detalhe: "Cadastrar novo desconto", destaque: true },
  { href: "/admin/ofertas", icone: "▦", titulo: "Gerenciar ofertas", detalhe: "Editar, arquivar e republicar" },
  { href: "/admin/cupons", icone: "✂", titulo: "Gerenciar cupons", detalhe: "Compartilhar, vencer e arquivar" },
  { href: "/admin/relatorios", icone: "↗", titulo: "Relatórios", detalhe: "Visualizações e cliques" },
  { href: "/admin/usuarios", icone: "♙", titulo: "Usuários", detalhe: "Acessos e permissões" },
];

export default function AdminHomePage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  useEffect(() => {
    const supabase = criarClienteNavegador();
    Promise.all([listarOfertas(supabase), listarCuponsParaBuscaAdmin(supabase)])
      .then(([o,c]) => { setOfertas(o); setCupons(c); })
      .catch(() => setErro("Não foi possível carregar as estatísticas. Confira a conexão."))
      .finally(() => setCarregando(false));
  }, []);

  const metricas = [
    { titulo: "Ofertas ativas", numero: ofertas.filter(o => o.status === "publicada" && !ofertaEstaExpirada(o)).length, icone: "▣" },
    { titulo: "Cupons ativos", numero: cupons.filter(c => c.ativo && !cupomExpirado(c)).length, icone: "🎟" },
    { titulo: "Ofertas vencidas", numero: ofertas.filter(ofertaEstaExpirada).length, icone: "◷" },
    { titulo: "Cupons vencidos", numero: cupons.filter(c => c.ativo && cupomExpirado(c)).length, icone: "⌛" },
    { titulo: "Rascunhos", numero: ofertas.filter(o => o.status === "rascunho").length, icone: "✎" },
    { titulo: "Cupons arquivados", numero: cupons.filter(c => !c.ativo).length, icone: "▤" },
  ];
  return (
    <div className="space-y-7 pb-8">
      <div className="rounded-[26px] bg-gradient-to-br from-[#35215D] to-[#694A9A] p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">Achados do Alê · Administração</p>
        <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Seu painel de controle</h1>
        <p className="mt-2 max-w-xl text-sm text-white/80">Acompanhe suas publicações e acesse rapidamente todas as ferramentas do site.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/admin/ofertas/nova" className="rounded-xl bg-[#F5B942] px-5 py-3 text-sm font-bold text-[#281842] shadow-sm hover:brightness-105">＋ Nova oferta</Link>
          <Link href="/admin/cupons/novo" className="rounded-xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/25">＋ Novo cupom</Link>
        </div>
      </div>
      <section>
        <h2 className="text-lg font-bold text-[#35215D]">Visão geral</h2>
        <p className="mt-1 text-xs text-ink/55">Dados reais cadastrados no site · Atualizados ao abrir a página</p>
        {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {metricas.map(m => <div key={m.titulo} className="rounded-[20px] border border-[#35215D]/10 bg-white p-4 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2ECFA] text-xl text-[#50347B]">{m.icone}</div>
            <p className="text-xs text-ink/60">{m.titulo}</p>
            <p className="mt-1 text-2xl font-extrabold text-[#35215D]">{carregando ? "…" : m.numero}</p>
          </div>)}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-bold text-[#35215D]">Acesso rápido</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {atalhos.map(a => <Link key={a.href} href={a.href} className="group flex min-h-[108px] items-center gap-4 rounded-[20px] border border-[#35215D]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#6E4DA0]/35 hover:shadow-md">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${a.destaque ? "bg-[#FFF2CF] text-[#35215D]" : "bg-[#F2ECFA] text-[#50347B]"}`}>{a.icone}</span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#35215D]">{a.titulo}</span><span className="mt-1 block text-xs text-ink/55">{a.detalhe}</span></span>
            <span aria-hidden="true" className="text-xl text-[#6E4DA0] transition group-hover:translate-x-1">›</span>
          </Link>)}
        </div>
      </section>
    </div>
  );
}
