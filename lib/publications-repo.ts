import { SupabaseClient } from "@supabase/supabase-js";

export async function registrarPublicacao(
  supabase: SupabaseClient,
  dados: {
    offerId: string;
    canal: string;
    status: string;
    textoPublicado?: string;
    idExterno?: string;
    erro?: string;
  }
) {
  const { error } = await supabase.from("publications").insert({
    offer_id: dados.offerId,
    canal: dados.canal,
    status: dados.status,
    texto_publicado: dados.textoPublicado ?? null,
    id_externo: dados.idExterno ?? null,
    erro: dados.erro ?? null,
  });
  if (error) throw error;
}

export async function listarPublicacoes(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("publications")
    .select("*, offers(titulo)")
    .order("enviado_em", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}
