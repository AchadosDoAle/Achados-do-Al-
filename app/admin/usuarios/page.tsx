"use client";

import { useEffect, useState } from "react";

type Usuario = {
  user_id: string;
  email: string;
  nome: string | null;
  role: "owner" | "admin";
  criado_em?: string;
};

export default function GerenciadorUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [semPermissao, setSemPermissao] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "owner">("admin");
  const [enviando, setEnviando] = useState(false);
  const [senhaGerada, setSenhaGerada] = useState<{ email: string; senha: string } | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const resp = await fetch("/api/admin/usuarios");
      if (resp.status === 403) {
        setSemPermissao(true);
        return;
      }
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Erro ao carregar usuários.");
      setUsuarios(dados.usuarios ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionarUsuario(evento: React.FormEvent) {
    evento.preventDefault();
    setErro("");
    setSenhaGerada(null);
    if (!email.trim()) {
      setErro("Informe um e-mail.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nome, role }),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Erro ao adicionar usuário.");
      if (dados.senhaTemporaria) {
        setSenhaGerada({ email, senha: dados.senhaTemporaria });
      }
      setNome("");
      setEmail("");
      setRole("admin");
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao adicionar usuário.");
    } finally {
      setEnviando(false);
    }
  }

  async function alterarPapel(userId: string, novoRole: "admin" | "owner") {
    setErro("");
    try {
      const resp = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: novoRole }),
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Erro ao atualizar papel.");
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao atualizar papel.");
    }
  }

  async function removerUsuario(userId: string, emailUsuario: string) {
    const confirmou = window.confirm(
      `Remover o acesso de ${emailUsuario} ao painel e ao app? A conta de login dela não será apagada.`
    );
    if (!confirmou) return;
    setErro("");
    try {
      const resp = await fetch(`/api/admin/usuarios/${userId}`, { method: "DELETE" });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || "Erro ao remover usuário.");
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao remover usuário.");
    }
  }

  if (semPermissao) {
    return (
      <div className="rounded-[22px] border border-brand/10 bg-white p-6 text-sm text-ink/70 shadow-sm">
        <p className="font-semibold text-ink">Acesso restrito</p>
        <p className="mt-1">
          Só administradores com o papel <strong>owner</strong> podem ver e gerenciar outros usuários. Peça para um
          administrador owner te dar essa permissão, se precisar.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Usuários</h1>
        <p className="mt-1 text-sm text-ink/55">
          Quem pode acessar o painel web e o app administrativo, e com qual nível de permissão.
        </p>
      </div>

      <form
        onSubmit={adicionarUsuario}
        className="mb-6 grid gap-3 rounded-[22px] border border-brand/10 bg-white p-5 shadow-sm sm:grid-cols-2"
      >
        <label className="block text-sm font-medium text-ink sm:col-span-1">
          Nome
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Opcional"
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-1">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pessoa@exemplo.com"
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-1">
          Papel
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "owner")}
            className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="admin">Admin (ofertas, cupons, relatórios)</option>
            <option value="owner">Owner (acesso completo + gerenciar usuários)</option>
          </select>
        </label>
        <div className="flex items-end sm:col-span-1">
          <button
            type="submit"
            disabled={enviando}
            className="admin-action w-full rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-60"
          >
            {enviando ? "Adicionando..." : "+ Adicionar usuário"}
          </button>
        </div>
      </form>

      {senhaGerada && (
        <div className="mb-6 rounded-[18px] border border-trust/30 bg-trust/10 p-4 text-sm text-ink">
          <p className="font-semibold">Usuário criado com senha temporária</p>
          <p className="mt-1">
            Envie para <strong>{senhaGerada.email}</strong> a senha abaixo por um canal seguro. Ela deve trocá-la no
            primeiro acesso (opção &quot;Esqueci minha senha&quot; na tela de login).
          </p>
          <p className="mt-2 rounded-lg bg-white px-3 py-2 font-mono text-base tracking-wide text-ink ring-1 ring-ink/10">
            {senhaGerada.senha}
          </p>
        </div>
      )}

      {erro && <p className="mb-4 text-sm font-medium text-accent-dark">{erro}</p>}

      {carregando ? (
        <p className="text-sm text-ink/60">Carregando...</p>
      ) : usuarios.length === 0 ? (
        <div className="rounded-[22px] border border-brand/10 bg-white p-5 text-sm text-ink/60 shadow-sm">
          Nenhum usuário cadastrado ainda.
        </div>
      ) : (
        <ul className="grid gap-3">
          {usuarios.map((usuario) => (
            <li
              key={usuario.user_id}
              className="flex flex-col gap-3 rounded-[18px] border border-brand/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-bold text-ink">{usuario.nome || usuario.email}</p>
                <p className="text-xs text-ink/55">{usuario.email}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    usuario.role === "owner" ? "bg-brand/10 text-brand" : "bg-ink/5 text-ink/60"
                  }`}
                >
                  {usuario.role === "owner" ? "Owner" : "Admin"}
                </span>
                <select
                  value={usuario.role}
                  onChange={(e) => alterarPapel(usuario.user_id, e.target.value as "admin" | "owner")}
                  className="rounded-lg border border-ink/15 px-2 py-1.5 text-xs outline-none focus:border-brand"
                >
                  <option value="admin">Tornar admin</option>
                  <option value="owner">Tornar owner</option>
                </select>
                <button
                  onClick={() => removerUsuario(usuario.user_id, usuario.email)}
                  className="admin-action-soft rounded-lg border px-3 py-1.5 text-xs font-semibold"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
