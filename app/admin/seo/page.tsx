import Link from "next/link";
import { URL_SITE } from "@/lib/seo-brand";

export default function SeoAdminPage() {
  const checks = [
    { titulo: "Sitemap XML", texto: "Lista dinâmica de páginas públicas e ofertas ativas.", href: "/sitemap.xml", acao: "Abrir sitemap" },
    { titulo: "Robots.txt", texto: "Instruções para rastreadores e referência ao sitemap.", href: "/robots.txt", acao: "Ver robots.txt" },
    { titulo: "Google Search Console", texto: "Indexação, consultas orgânicas e páginas com problemas. Requer verificar o domínio no Google.", href: "https://search.google.com/search-console", acao: "Abrir Search Console" },
    { titulo: "PageSpeed Insights", texto: "Desempenho real, acessibilidade e Core Web Vitals, sem números inventados.", href: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(URL_SITE)}`, acao: "Testar desempenho" },
    { titulo: "Rich Results Test", texto: "Validação de dados estruturados em páginas de ofertas.", href: `https://search.google.com/test/rich-results?url=${encodeURIComponent(URL_SITE)}`, acao: "Testar dados estruturados" },
  ];
  return <div className="space-y-6 pb-10">
    <header className="rounded-3xl bg-gradient-to-r from-[#35215D] to-[#694A9A] p-6 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-white/70">Achados do Alê</p>
      <h1 className="mt-2 text-2xl font-extrabold">SEO e visibilidade</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/85">Ferramentas de diagnóstico e indexação. Os relatórios externos são consultados diretamente nos serviços oficiais.</p>
    </header>
    <div className="grid gap-4 md:grid-cols-2">{checks.map(c => <article key={c.titulo} className="rounded-2xl border border-[#35215D]/10 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-[#35215D]">{c.titulo}</h2><p className="mt-2 text-sm text-gray-600">{c.texto}</p>
      <Link href={c.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-[#35215D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#694A9A]">{c.acao} ↗</Link>
    </article>)}</div>
    <section className="rounded-2xl border border-[#35215D]/10 bg-white p-5"><h2 className="font-bold text-[#35215D]">Checklist de publicação</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700"><li>Verifique o domínio no Search Console e envie o sitemap <code>{URL_SITE}/sitemap.xml</code>.</li><li>Confira títulos, descrições, URL canônica e imagem de compartilhamento de cada oferta.</li><li>Não indexe rotas administrativas, login, APIs ou páginas privadas.</li><li>Revise ofertas expiradas e links quebrados antes de solicitar indexação.</li><li>Use PageSpeed Insights para localizar gargalos reais; nenhuma pontuação é presumida aqui.</li></ul>
    </section>
  </div>;
}
