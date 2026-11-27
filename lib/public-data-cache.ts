import { unstable_cache } from "next/cache";
import { criarClientePublico } from "@/lib/supabase/public";
import { listarOfertasResumo } from "@/lib/offers-repo";
import { listarCuponsParaBuscaPublica, listarLojasCuponsPublicas } from "@/lib/coupons-repo";

// Cache compartilhado do Next.js: ao contrário de variáveis em memória,
// reaproveita os resultados entre requisições e instâncias da aplicação.
// Os dados públicos podem ficar no máximo 30s sem atualização.
export const obterOfertasPublicasCacheadas = unstable_cache(
  async () => listarOfertasResumo(criarClientePublico()),
  ["achados-public-offers-v1"],
  { revalidate: 30, tags: ["public-offers"] }
);

// A busca textual precisa preservar a regra atual de pesquisa sem acentos.
// Cacheia o conjunto de cupons ativos para não percorrer lotes a cada pesquisa.
export const obterCuponsPublicosParaBuscaCacheados = unstable_cache(
  async () => listarCuponsParaBuscaPublica(criarClientePublico()),
  ["achados-public-coupons-search-v1"],
  { revalidate: 60, tags: ["public-coupons"] }
);

// A lista de lojas muda pouco e antes era reconstruída percorrendo os cupons
// em lotes em cada carregamento da página de cupons.
export const obterLojasCuponsPublicasCacheadas = unstable_cache(
  async () => listarLojasCuponsPublicas(criarClientePublico()),
  ["achados-public-coupon-stores-v1"],
  { revalidate: 600, tags: ["public-coupons", "public-coupon-stores"] }
);
