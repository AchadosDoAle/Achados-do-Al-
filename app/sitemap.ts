import type { MetadataRoute } from "next";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertas } from "@/lib/offers-repo";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://achadosdoale.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paginasFixas: MetadataRoute.Sitemap = [
    {
      url: URL_SITE,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${URL_SITE}/cupons`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${URL_SITE}/categorias`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  try {
    const supabase = criarClientePublico();
    const ofertas = await listarOfertas(supabase, { apenasPublicadas: true });

    const paginasOfertas: MetadataRoute.Sitemap = ofertas
      .filter((oferta) => oferta.status === "publicada" && !ofertaEstaExpirada(oferta))
      .map((oferta) => ({
        url: `${URL_SITE}/oferta/${oferta.slug}`,
        lastModified: new Date(oferta.atualizadoEm),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    return [...paginasFixas, ...paginasOfertas];
  } catch {
    return paginasFixas;
  }
}
