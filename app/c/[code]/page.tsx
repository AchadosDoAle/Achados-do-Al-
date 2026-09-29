import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClientePublico } from "@/lib/supabase/public";
import {
  beneficioCupom,
  buscarCupomPorCodigoCurto,
  formatarValidadeCupom,
} from "@/lib/cupom-share";
import { cupomExpirado } from "@/lib/coupons-repo";
import { URL_SITE } from "@/lib/seo-brand";
import RedirecionarCupom from "@/components/RedirecionarCupom";

export const revalidate = 0;

async function buscar(code: string) {
  const cupom = await buscarCupomPorCodigoCurto(criarClientePublico(), code);
  return cupom?.ativo ? cupom : null;
}

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const cupom = await buscar(params.code);
  if (!cupom) return {};

  const beneficio = beneficioCupom(cupom);
  const validade = formatarValidadeCupom(cupom.validade);
  const url = `${URL_SITE}/c/${params.code}`;
  const titulo = `CUPOM LIBERADO: ${cupom.nomeCupom}`;
  const descricao = [beneficio, cupom.loja, `Validade: ${validade}`].filter(Boolean).join(" · ");
  const imagem = `${url}/opengraph-image`;

  return {
    title: titulo,
    description: descricao,
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      title: titulo,
      description: descricao,
      url,
      siteName: "Achado do Alê",
      locale: "pt_BR",
      images: [{ url: imagem, width: 1200, height: 630, alt: titulo }],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [imagem],
    },
  };
}

export default async function PaginaCupomCompartilhado({
  params,
}: {
  params: { code: string };
}) {
  const cupom = await buscar(params.code);
  if (!cupom) notFound();

  const expirado = cupomExpirado(cupom);
  const beneficio = beneficioCupom(cupom);
  const destino = cupom.linkProdutos?.trim() || "";
  const podeRedirecionar = !expirado && /^https?:\/\//i.test(destino);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-5 text-text">
      {podeRedirecionar && <RedirecionarCupom destino={destino} />}

      <div className="w-full max-w-md overflow-hidden rounded-xl2 bg-card ring-1 ring-white/10">
        <div className="bg-gold px-5 py-3 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-bg">
          Cupom liberado · Achado do Alê
        </div>
        <div className="p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">🏪 {cupom.loja}</p>
          <h1 className="mt-3 break-words font-display text-3xl font-extrabold text-gold">
            {cupom.nomeCupom}
          </h1>
          {beneficio && <p className="mt-3 text-xl font-bold text-trust">{beneficio}</p>}
          <p className="mt-3 text-sm text-text-muted">
            ⏰ Validade: {formatarValidadeCupom(cupom.validade)}
          </p>

          {expirado ? (
            <p className="mt-5 rounded-xl bg-danger/15 px-4 py-3 text-sm font-semibold text-danger">
              Este cupom está vencido.
            </p>
          ) : podeRedirecionar ? (
            <>
              <p className="mt-5 text-sm text-text-muted">Abrindo a página do cupom na loja…</p>
              <a
                href={destino}
                rel="noopener noreferrer nofollow sponsored"
                className="mt-4 inline-flex rounded-xl2 bg-gold px-5 py-3 font-semibold text-bg"
              >
                Ir para {cupom.loja}
              </a>
            </>
          ) : (
            <p className="mt-5 text-sm text-text-muted">
              Copie o código acima e consulte as condições na página de cupons.
            </p>
          )}

          <Link href="/cupons" className="mt-5 block text-sm font-semibold text-gold hover:underline">
            Ver todos os cupons
          </Link>
        </div>
      </div>
    </main>
  );
}
