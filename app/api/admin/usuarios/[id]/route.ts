import { NextResponse, type NextRequest } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { obterAdminAtual } from "@/lib/admin-auth";

async function contarOwners(supabaseAdmin: ReturnType<typeof criarClienteAdmin>) {
  const { count, error } = await supabaseAdmin
    .from("admin_users")
    .select("user_id", { count: "exact", head: true })
    .eq("role", "owner");
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await obterAdminAtual();
  if (!admin) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  if (admin.role !== "owner") {
    return NextResponse.json({ erro: "Apenas administradores 'owner' podem editar usuários." }, { status: 403 });
  }

  const corpo = await req.json().catch(() => null);
  const supabaseAdmin = criarClienteAdmin();
  const alteracoes: Record<string, unknown> = {};

  if (typeof corpo?.nome === "string") alteracoes.nome = corpo.nome.trim() || null;

  if (corpo?.role && corpo.role !== "owner" && corpo.role !== "admin") {
    return NextResponse.json({ erro: "Papel inválido." }, { status: 400 });
  }

  if (corpo?.role === "admin") {
    // Rebaixando para "admin": não pode ser o último owner do painel.
    const { data: alvo } = await supabaseAdmin.from("admin_users").select("role").eq("user_id", params.id).maybeSingle();
    if (alvo?.role === "owner") {
      const owners = await contarOwners(supabaseAdmin);
      if (owners <= 1) {
        return NextResponse.json({ erro: "Precisa existir pelo menos um administrador 'owner'." }, { status: 400 });
      }
    }
    alteracoes.role = "admin";
  } else if (corpo?.role === "owner") {
    alteracoes.role = "owner";
  }

  if (Object.keys(alteracoes).length === 0) {
    return NextResponse.json({ erro: "Nada para atualizar." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .update(alteracoes)
    .eq("user_id", params.id)
    .select("user_id, email, nome, role")
    .maybeSingle();

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, usuario: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await obterAdminAtual();
  if (!admin) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  if (admin.role !== "owner") {
    return NextResponse.json({ erro: "Apenas administradores 'owner' podem remover usuários." }, { status: 403 });
  }

  const supabaseAdmin = criarClienteAdmin();

  const { data: alvo } = await supabaseAdmin.from("admin_users").select("role").eq("user_id", params.id).maybeSingle();
  if (alvo?.role === "owner") {
    const owners = await contarOwners(supabaseAdmin);
    if (owners <= 1) {
      return NextResponse.json({ erro: "Não é possível remover o único administrador 'owner'." }, { status: 400 });
    }
  }

  // Remove só o acesso ao painel/app (linha em admin_users). A conta de
  // login em si não é apagada, então isso nunca destrói dados de outro
  // lugar do site sem querer.
  const { error } = await supabaseAdmin.from("admin_users").delete().eq("user_id", params.id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
