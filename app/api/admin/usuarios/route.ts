import { NextResponse, type NextRequest } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { obterAdminAtual } from "@/lib/admin-auth";

function gerarSenhaTemporaria() {
  // Senha temporária aleatória e fácil de digitar uma vez (o novo
  // administrador deve trocá-la no primeiro acesso, pelo "Esqueci
  // minha senha" na tela de login do site ou do app).
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let senha = "";
  for (let i = 0; i < 12; i++) {
    senha += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return senha;
}

export async function GET() {
  const admin = await obterAdminAtual();
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  if (admin.role !== "owner") {
    return NextResponse.json({ erro: "Apenas administradores 'owner' podem ver esta lista." }, { status: 403 });
  }

  const supabase = criarClienteAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id, email, nome, role, criado_em")
    .order("criado_em", { ascending: true });

  if (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ usuarios: data ?? [] });
}

export async function POST(req: NextRequest) {
  const admin = await obterAdminAtual();
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  if (admin.role !== "owner") {
    return NextResponse.json({ erro: "Apenas administradores 'owner' podem adicionar usuários." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  const email = String(corpo?.email || "").trim().toLowerCase();
  const nome = String(corpo?.nome || "").trim() || null;
  const role = corpo?.role === "owner" ? "owner" : "admin";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ erro: "Informe um e-mail válido." }, { status: 400 });
  }

  const supabaseAdmin = criarClienteAdmin();
  const senhaTemporaria = gerarSenhaTemporaria();

  const { data: novoUsuario, error: erroCriacao } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senhaTemporaria,
    email_confirm: true,
  });

  let userId: string;
  let senhaParaExibir: string | null = senhaTemporaria;

  if (erroCriacao) {
    const jaExiste = /already.*registered|already.*exists/i.test(erroCriacao.message);
    if (!jaExiste) {
      return NextResponse.json({ erro: erroCriacao.message }, { status: 500 });
    }
    // O e-mail já tem conta no Supabase Auth (ex.: já é cliente do site).
    // Localizamos o ID dele para só adicionar o acesso de administrador,
    // sem mexer na senha que essa pessoa já usa.
    const { data: lista, error: erroLista } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (erroLista) {
      return NextResponse.json({ erro: erroLista.message }, { status: 500 });
    }
    const encontrado = lista.users.find((u) => (u.email || "").toLowerCase() === email);
    if (!encontrado) {
      return NextResponse.json({ erro: "Não foi possível localizar esse e-mail." }, { status: 500 });
    }
    userId = encontrado.id;
    senhaParaExibir = null; // já tem senha própria, não geramos uma nova
  } else {
    userId = novoUsuario.user.id;
  }

  const { error: erroInsert } = await supabaseAdmin
    .from("admin_users")
    .upsert({ user_id: userId, email, nome, role }, { onConflict: "user_id" });

  if (erroInsert) {
    return NextResponse.json({ erro: erroInsert.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    usuario: { user_id: userId, email, nome, role },
    senhaTemporaria: senhaParaExibir,
  });
}
