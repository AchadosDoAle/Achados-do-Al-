"use client";

import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function BotaoSair() {
  const router = useRouter();
  const supabase = criarClienteNavegador();

  async function sair() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={sair} className="admin-action rounded-xl border px-4 py-2 text-sm font-semibold">
      Sair
    </button>
  );
}
