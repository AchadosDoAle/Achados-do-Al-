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
import ReportarOferta from "@/components/ReportarOferta";
import OfertaCompraFixa from "@/components/OfertaCompraFixa";
import { ofertaEstaExpirada } from "@/lib/oferta-status";

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

  const precoMeta = oferta.precoPix ?? oferta.precoAtual;
  const descricao = precoMeta != null
    ? `${oferta.loja} · por ${precoMeta.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
    : `${oferta.loja} · confira a promoção no Achado do Alê`;

  const expirada = ofertaEstaExpirada(oferta);
  const url = `${URL_SITE}/oferta/${oferta.slug}`;

  return {
    title: oferta.titulo,
    description: descricao,
    alternates: { canonical: url },
    robots: expirada
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: oferta.titulo,
      description: descricao,
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: oferta.titulo }],
      url,
      siteName: "Achado do Alê",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: oferta.titulo,
      description: descricao,
      images: [`${url}/opengraph-image`],
    },
  };
}

function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string) {
  const iso = data.slice(0, 10);
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : data;
}

export default async function PaginaOferta({
  params,
}: {
  params: { slug: string };
}) {
  const oferta = await buscar(params.slug);
  if (!oferta || !["publicada", "expirada"].includes(oferta.status)) notFound();

  const expirada = ofertaEstaExpirada(oferta);

  // Quando existe preço à vista no Pix, ele é o menor preço efetivo da oferta
  // e por isso é usado como referência para o percentual de desconto.
  const precoParaDesconto = oferta.precoPix ?? oferta.precoAtual;
  const desconto =
    precoParaDesconto != null &&
    oferta.precoAntigo &&
    oferta.precoAntigo > precoParaDesconto
      ? Math.round(
          ((oferta.precoAntigo - precoParaDesconto) / oferta.precoAntigo) * 100
        )
      : null;

  // Todos os cliques de saída passam pelo redirecionador para alimentar os relatórios.
  const linkFinal = `${URL_SITE}/r/${oferta.id}`;

  const precoEstruturado = oferta.precoPix ?? oferta.precoAtual;
  const imagemEstruturada = oferta.imagemPrincipal
    ? new URL(oferta.imagemPrincipal, URL_SITE).toString()
    : `${URL_SITE}/icon.png`;
  const produtoJsonLd = {
    "@type": "Product",
    name: oferta.titulo,
    image: [imagemEstruturada],
    description: `${oferta.titulo} em ${oferta.loja}. Confira preço, condições e disponibilidade.`,
    category: oferta.categoria,
    ...(oferta.marca
      ? { brand: { "@type": "Brand", name: oferta.marca } }
      : {}),
    ...(precoEstruturado != null
      ? {
          offers: {
            "@type": "Offer",
            url: `${URL_SITE}/oferta/${oferta.slug}`,
            priceCurrency: "BRL",
            price: precoEstruturado,
            availability: expirada
              ? "https://schema.org/OutOfStock"
              : "https://schema.org/InStock",
            ...(oferta.validadePromocao
              ? { priceValidUntil: oferta.validadePromocao }
              : {}),
            seller: {
              "@type": "Organization",
              name: oferta.loja,
            },
          },
        }
      : {}),
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      produtoJsonLd,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: `${URL_SITE}/` },
          { "@type": "ListItem", position: 2, name: oferta.categoria, item: `${URL_SITE}/categoria/${oferta.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}` },
          { "@type": "ListItem", position: 3, name: oferta.titulo, item: `${URL_SITE}/oferta/${oferta.slug}` },
        ],
      },
    ],
  };


  return (
    <main className="min-h-screen bg-bg pb-bottom-nav">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <Container className="p-4">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-gold"
        >
          ← Voltar para o início
        </Link>

        {expirada && (
          <div className="mb-5 rounded-xl2 border border-white/10 bg-white/5 p-4">
            <p className="font-display text-base font-bold text-text-muted">OFERTA ESGOTADA</p>
            <p className="mt-1 text-sm text-text-muted">O preço ou a disponibilidade podem ter mudado. A página continua disponível para consulta.</p>
          </div>
        )}

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
                } ${expirada ? "grayscale opacity-60" : ""}`}
              />
              {!expirada && desconto ? (
                <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-sm font-bold text-bg">
                  -{desconto}%
                </span>
              ) : null}
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

            <div className="mt-4">
              {oferta.precoAntigo && (
                <span className="block text-base text-text-muted line-through">
                  {formatarPreco(oferta.precoAntigo)}
                </span>
              )}

              {oferta.precoPix != null ? (
                <div className="mt-2 rounded-xl2 border border-trust/30 bg-trust/10 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-trust">
                    💸 Preço no Pix
                  </p>
                  <p
                    className={`mt-1 font-display text-4xl font-extrabold ${
                      expirada ? "text-text-muted" : "text-trust"
                    }`}
                  >
                    {expirada ? "ESGOTADO · " : ""}{formatarPreco(oferta.precoPix)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">Melhor preço à vista</p>
                </div>
              ) : oferta.precoAtual != null ? (
                <p
                  className={`mt-2 font-display text-3xl font-bold ${
                    expirada ? "text-text-muted" : "text-gold"
                  }`}
                >
                  {expirada ? "ESGOTADO · " : ""}{formatarPreco(oferta.precoAtual)}
                </p>
              ) : (
                <p className="mt-2 text-base font-semibold text-text-muted">
                  Consulte o preço atualizado no site da loja
                </p>
              )}

              {oferta.precoPix != null && oferta.precoAtual != null && (
                <p className="mt-3 text-sm text-text-muted">
                  {oferta.ofereceParcelamento ? "Preço total parcelado" : "Preço atual"}: {" "}
                  <span className="font-semibold text-text">{formatarPreco(oferta.precoAtual)}</span>
                </p>
              )}

              {oferta.ofereceParcelamento && oferta.parcelas && oferta.valorParcela && (
                <p className="mt-2 text-sm text-text-muted">
                  {oferta.parcelas}x de {formatarPreco(oferta.valorParcela)}{" "}
                  <span
                    className={
                      oferta.parcelamentoSemJuros
                        ? "font-semibold text-trust"
                        : "font-semibold text-text-muted"
                    }
                  >
                    {oferta.parcelamentoSemJuros ? "sem juros" : "com juros"}
                  </span>
                </p>
              )}
            </div>

            {(oferta.freteGratis || oferta.freteCondicao) && (
              <div className="mt-3 rounded-xl2 border border-trust/20 bg-trust/10 p-3">
                <p className="text-sm font-semibold text-trust">
                  🚚 {oferta.freteGratis ? "Frete grátis" : "Condição de frete"}
                </p>
                {oferta.freteCondicao && (
                  <p className="mt-1 text-sm leading-5 text-text-muted">
                    {oferta.freteCondicao}
                  </p>
                )}
              </div>
            )}

            {(oferta.cupom || oferta.cupomDescricao || oferta.linkCupom) && (
              <div className="mt-5 rounded-xl2 border border-gold/20 bg-gold/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
                  🏷️ Cupom desta oferta
                </p>

                {oferta.cupomDescricao && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text">
                    {oferta.cupomDescricao}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {oferta.cupom && <BotaoCopiarCupom cupom={oferta.cupom} />}
                  {oferta.linkCupom && (
                    <a
                      href={oferta.linkCupom}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-bg hover:bg-gold-light"
                    >
                      🔗 Abrir link do cupom
                    </a>
                  )}
                </div>

                {oferta.linkCupom && (
                  <p className="mt-2 break-all text-xs text-text-muted">
                    Link do cupom: {oferta.linkCupom}
                  </p>
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

            {!expirada && <ReportarOferta ofertaId={oferta.id} />}

            <a
              href="/grupo"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-xl2 bg-trust/15 py-3 text-center text-sm font-medium text-trust"
            >
              Entrar no canal do WhatsApp
            </a>
          </div>
        </div>
      </Container>

      <OfertaCompraFixa
        href={linkFinal}
        expirada={expirada}
        preco={oferta.precoPix ?? oferta.precoAtual}
      />
      <Footer />
      <BottomNav />
    </main>
  );
}
