import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { criarClientePublico } from "@/lib/supabase/public";
import {
  buscarOfertaPorCodigoCurto,
  descricaoSocialDaOferta,
  formatarPrecoSocial,
  imagensSociaisDaOferta,
  precoPrincipalDaOferta,
  precoPrincipalEhPix,
  tituloSocialDaOferta,
} from "@/lib/oferta-share";
import { URL_SITE } from "@/lib/seo-brand";
import RedirecionarOferta from "@/components/RedirecionarOferta";

export const revalidate = 0;

async function buscar(code: string) {
  return buscarOfertaPorCodigoCurto(criarClientePublico(), code);
}

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const oferta = await buscar(params.code);
  if (!oferta) return {};

  const urlCurta = `${URL_SITE}/p/${params.code.toLowerCase()}`;
  const urlLonga = `${URL_SITE}/oferta/${oferta.slug}`;
  const tituloSocial = tituloSocialDaOferta(oferta);
  const descricao = descricaoSocialDaOferta(oferta);
  // O WhatsApp geralmente utiliza apenas o PRIMEIRO og:image.
  // Links externos de imagens podem ser bloqueados para bots; usamos a nossa rota.
  const imagensCompartilhamento = imagensSociaisDaOferta(oferta);

  return {
    title: oferta.titulo,
    description: descricao,
    alternates: { canonical: urlLonga },
    openGraph: {
      type: "website",
      title: tituloSocial,
      description: descricao,
      url: urlCurta,
      siteName: "Achado do Alê",
      locale: "pt_BR",
      images: imagensCompartilhamento.map((url) => ({ url, alt: oferta.titulo })),
    },
    twitter: {
      card: "summary_large_image",
      title: tituloSocial,
      description: descricao,
      images: imagensCompartilhamento,
    },
  };
}

export default async function PaginaLinkCurto({
  params,
}: {
  params: { code: string };
}) {
  const oferta = await buscar(params.code);
  if (!oferta) notFound();

  const destino = `/oferta/${oferta.slug}`;
  const preco = precoPrincipalDaOferta(oferta);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-5 text-text">
      <RedirecionarOferta destino={destino} />
      <div className="w-full max-w-md rounded-xl2 bg-card p-5 text-center ring-1 ring-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={oferta.imagemPrincipal || "/icon.png"}
          alt={oferta.titulo}
          className="mx-auto h-36 w-36 rounded-xl object-contain bg-white p-2"
        />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gold">
          Achado do Alê
        </p>
        <h1 className="mt-2 font-display text-xl font-bold">{oferta.titulo}</h1>
        {preco != null ? (
          <p className="mt-2 text-lg font-bold text-trust">
            {formatarPrecoSocial(preco)}{precoPrincipalEhPix(oferta) ? " no Pix" : ""}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-text-muted">🏪 {oferta.loja}</p>
        <p className="mt-4 text-sm text-text-muted">Abrindo a promoção…</p>
        <Link
          href={destino}
          className="mt-4 inline-flex rounded-xl2 bg-gold px-5 py-3 font-semibold text-bg"
        >
          Abrir agora
        </Link>
      </div>
    </main>
  );
}
