import { NextResponse } from "next/server";
import { usuarioEhAdmin } from "@/lib/admin-auth";
import { criarClienteAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const LIMITE_BYTES = 8 * 1024 * 1024;
const FORMATOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  if (!(await usuarioEhAdmin())) {
    return NextResponse.json({ erro: "Acesso não autorizado." }, { status: 401 });
  }

  try {
    const dados = await req.formData();
    const arquivo = dados.get("imagem");
    if (!(arquivo instanceof File)) {
      return NextResponse.json({ erro: "Selecione uma foto." }, { status: 400 });
    }
    const extensao = FORMATOS[arquivo.type];
    if (!extensao || arquivo.size === 0 || arquivo.size > LIMITE_BYTES) {
      return NextResponse.json({ erro: "Use uma imagem JPG, PNG, WEBP, AVIF ou GIF de até 8 MB." }, { status: 400 });
    }

    const supabase = criarClienteAdmin();
    const nome = `produtos/${crypto.randomUUID()}.${extensao}`;
    const { error } = await supabase.storage.from("ofertas").upload(nome, arquivo, {
      contentType: arquivo.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      console.error("Erro no upload de oferta:", error);
      return NextResponse.json({ erro: "Falha ao enviar a imagem ao armazenamento." }, { status: 500 });
    }
    const { data } = supabase.storage.from("ofertas").getPublicUrl(nome);
    if (!data.publicUrl?.startsWith("https://")) {
      return NextResponse.json({ erro: "Não foi possível obter o endereço público da imagem." }, { status: 500 });
    }
    return NextResponse.json({ imagemUrl: data.publicUrl });
  } catch (erro) {
    console.error("Erro no upload de imagem:", erro);
    return NextResponse.json({ erro: "Erro no envio da imagem. Tente novamente." }, { status: 500 });
  }
}
