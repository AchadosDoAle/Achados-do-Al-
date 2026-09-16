import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { criarClientePublico } from "@/lib/supabase/public";
import { buscarOfertaPorSlug } from "@/lib/offers-repo";
import { BotaoCopiarCupom, BotaoCompartilhar } from "@/components/OfertaAcoes";
import BottomNav from "@/components/BottomNav";

const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://achadodoale.com.br";

async function buscar(slug: string) {
  const supabase = criarClientePublico();
  return buscarOfertaPorSlug(supabase, slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const oferta = await buscar(params.slug);
  if (!oferta) return {};

  const descricao = `${oferta.loja} · por ${oferta.precoAtual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;

  return {
    title: `${oferta.titulo} — Achado do Alê`,
    description: descricao,
    openGraph: {
      title: oferta.titulo,
      description: descricao,
      images: oferta.imagemPrincipal ? [oferta.imagemPrincipal] : undefined,
      url: `${URL_SITE}/oferta/${oferta.slug}`,
    },
  };
}

export default async function PaginaOferta({
  params,
}: {
  params: { slug: string };
}) {
  const oferta = await buscar(params.slug);
  if (!oferta || oferta.status !== "publicada") notFound();

  const linkFinal = oferta.usarLinkRedirecionamento
    ? `${URL_SITE}/r/${oferta.id}`
    : oferta.linkProduto;

  return (
    <main className="p-4 pb-bottom-nav">
      {oferta.imagemPrincipal && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={oferta.imagemPrincipal}
          alt={oferta.titulo}
          className="mb-4 aspect-square w-full rounded-xl2 object-cover ring-1 ring-ink/10"
        />
      )}

      <p className="text-xs font-medium text-ink/50">{oferta.loja}</p>
      <h1 className="font-display text-xl font-bold text-ink">
        {oferta.titulo}
      </h1>

      <div className="mt-3">
        {oferta.precoAntigo && (
          <p className="text-sm text-ink/40 line-through">
            {oferta.precoAntigo.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        )}
        <p className="text-2xl font-bold text-brand">
          {oferta.precoAtual.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        {oferta.parcelas && oferta.valorParcela && (
          <p className="text-sm text-ink/60">
            ou em até {oferta.parcelas}x de{" "}
            {oferta.valorParcela.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        )}
        {oferta.freteGratis && (
          <span className="mt-1 inline-block rounded-md bg-trust/10 px-2 py-0.5 text-xs font-semibold text-trust">
            Frete grátis
          </span>
        )}
      </div>

      <a
        href={linkFinal}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="mt-4 block rounded-xl2 bg-accent py-3 text-center font-medium text-white"
      >
        Ver oferta
      </a>

      <div className="mt-3 flex gap-2">
        {oferta.cupom && <BotaoCopiarCupom cupom={oferta.cupom} />}
        <BotaoCompartilhar
          titulo={oferta.titulo}
          url={`${URL_SITE}/oferta/${oferta.slug}`}
        />
      </div>

      {oferta.textoPublicacao && (
        <div className="mt-6 whitespace-pre-wrap rounded-xl2 bg-white p-4 text-sm text-ink/80 ring-1 ring-ink/10">
          {oferta.textoPublicacao}
        </div>
      )}

      {oferta.observacoes && (
        <p className="mt-3 text-xs text-ink/50">{oferta.observacoes}</p>
      )}

      <a
        href="https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block rounded-xl2 bg-trust/10 py-3 text-center text-sm font-medium text-trust"
      >
        Entrar no canal do WhatsApp
      </a>

      <BottomNav />
    </main>
  );
}
