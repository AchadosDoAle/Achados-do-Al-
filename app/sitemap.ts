import type { MetadataRoute } from "next";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertasResumo } from "@/lib/offers-repo";
import { ofertaEstaExpirada } from "@/lib/oferta-status";
import { CATEGORIAS_ADMIN, CATEGORIA_OUTROS } from "@/lib/mock-data";
import { slugificar } from "@/lib/texto";

const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://achadosdoale.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();
  const paginasFixas: MetadataRoute.Sitemap = [
    { url: URL_SITE, lastModified: agora, changeFrequency: "hourly", priority: 1 },
    { url: `${URL_SITE}/cupons`, lastModified: agora, changeFrequency: "daily", priority: 0.9 },
    { url: `${URL_SITE}/categorias`, lastModified: agora, changeFrequency: "weekly", priority: 0.7 },
    { url: `${URL_SITE}/perdeu`, lastModified: agora, changeFrequency: "daily", priority: 0.5 },
    { url: `${URL_SITE}/sobre`, lastModified: agora, changeFrequency: "monthly", priority: 0.5 },
    { url: `${URL_SITE}/afiliados`, lastModified: agora, changeFrequency: "monthly", priority: 0.5 },
    { url: `${URL_SITE}/privacidade`, lastModified: agora, changeFrequency: "monthly", priority: 0.3 },
    { url: `${URL_SITE}/termos`, lastModified: agora, changeFrequency: "monthly", priority: 0.3 },
    ...CATEGORIAS_ADMIN.filter((c) => c !== CATEGORIA_OUTROS).map((categoria) => ({
      url: `${URL_SITE}/categoria/${slugificar(categoria)}`,
      lastModified: agora, changeFrequency: "daily" as const, priority: 0.7,
    })),
  ];

  try {
    const ofertas = await listarOfertasResumo(criarClientePublico());
    const paginasOfertas: MetadataRoute.Sitemap = ofertas
      .filter((o) => o.status === "publicada" && !ofertaEstaExpirada(o))
      .map((o) => ({ url: `${URL_SITE}/oferta/${o.slug}`, lastModified: new Date(o.atualizadoEm), changeFrequency: "daily" as const, priority: 0.8 }));
    return [...paginasFixas, ...paginasOfertas];
  } catch {
    return paginasFixas;
  }
}
