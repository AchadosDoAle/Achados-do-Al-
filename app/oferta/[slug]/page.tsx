import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { criarClientePublico } from "@/lib/supabase/public";
import { buscarOfertaPorSlug } from "@/lib/offers-repo";
import { BotaoCopiarCupom, BotaoCompartilhar } from "@/components/OfertaAcoes";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

const URL_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://achadosdoale.com";

export const revalidate = 0;

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

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string) {
  try {
    return new Date(data).toLocaleDateString("pt-BR");
  } catch {
    return data;
  }
}

export default async function PaginaOferta({
  params,
}: {
  params: { slug: string };
}) {
  const oferta = await buscar(params.slug);
  if (!oferta || oferta.status !== "publicada") notFound();

  const desconto =
    oferta.precoAntigo && oferta.precoAntigo > oferta.precoAtual
      ? Math.round(
          ((oferta.precoAntigo - oferta.precoAtual) / oferta.precoAntigo) * 100
        )
      : null;

  const linkFinal = oferta.usarLinkRedirecionamento
    ? `${URL_SITE}/r/${oferta.id}`
    : oferta.linkProduto;

  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <Header />

      <Container className="p-4">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-gold"
        >
          ← Voltar para o início
        </Link>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          {/* Imagem */}
          <div className="order-1 mx-auto w-full max-w-[500px] shrink-0 md:order-2">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl2 bg-card ring-1 ring-white/5 md:h-[500px] md:w-[500px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={oferta.imagemPrincipal || "/icon.png"}
                alt={oferta.titulo}
                className={`h-full w-full ${
                  oferta.imagemPrincipal
                    ? "object-cover"
                    : "object-contain p-16 opacity-70"
                }`}
              />
              {desconto && (
                <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-sm font-bold text-bg">
                  -{desconto}%
                </span>
              )}
            </div>
          </div>

          {/* Informações */}
          <div className="order-2 md:order-1 md:flex-1">
            <p className="text-xs font-medium text-text-muted">
              🏪 {oferta.loja}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-text">
              {oferta.titulo}
            </h1>

            <div className="mt-4 flex items-end gap-3">
              {oferta.precoAntigo && (
                <span className="text-base text-text-muted line-through">
                  {formatarPreco(oferta.precoAntigo)}
                </span>
              )}
              <span className="text-3xl font-bold text-gold">
                {formatarPreco(oferta.precoAtual)}
              </span>
            </div>

            {oferta.precoPix && (
              <p className="mt-1 text-sm text-trust">
                {formatarPreco(oferta.precoPix)} à vista no Pix
              </p>
            )}
            {oferta.parcelas && oferta.valorParcela && (
              <p className="text-sm text-text-muted">
                ou {oferta.parcelas}x de {formatarPreco(oferta.valorParcela)}
              </p>
            )}
            {oferta.freteGratis && (
              <span className="mt-2 inline-block rounded-md bg-trust/15 px-2 py-0.5 text-xs font-semibold text-trust">
                Frete grátis
              </span>
            )}

            {(oferta.cupom || oferta.linkCupom) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {oferta.cupom && <BotaoCopiarCupom cupom={oferta.cupom} />}
                {oferta.linkCupom && (
                  <a
                    href={oferta.linkCupom}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="rounded-lg bg-gold/15 px-4 py-2 text-sm font-medium text-gold"
                  >
                    🔗 Resgatar cupom no site da loja
                  </a>
                )}
              </div>
            )}

            {oferta.validadePromocao && (
              <p className="mt-3 text-xs text-text-muted">
                ⏳ Promoção válida até {formatarData(oferta.validadePromocao)}
              </p>
            )}

            {oferta.textoPublicacao && (
              <div className="mt-5 whitespace-pre-wrap rounded-xl2 bg-card p-4 text-sm text-text-muted ring-1 ring-white/5">
                {oferta.textoPublicacao}
              </div>
            )}

            {oferta.observacoes && (
              <p className="mt-3 text-xs text-text-muted">
                {oferta.observacoes}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <a
                href={linkFinal}
                target="_blank"
                rel="noopener noreferrer nofollow sponsored"
                className="flex-1 rounded-xl2 bg-gold py-3 text-center font-semibold text-bg hover:bg-gold-light"
              >
                🛒 Acessar oferta
              </a>
              <BotaoCompartilhar
                titulo={oferta.titulo}
                url={`${URL_SITE}/oferta/${oferta.slug}`}
              />
            </div>

            <a
              href="https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-xl2 bg-trust/15 py-3 text-center text-sm font-medium text-trust"
            >
              Entrar no canal do WhatsApp
            </a>
          </div>
        </div>
      </Container>

      <Footer />
      <BottomNav />
    </main>
  );
}
