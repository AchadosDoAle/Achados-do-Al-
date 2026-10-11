# Correção do owner inicial — 26/09/2026

## Problema

O gerenciador de usuários exige o papel `owner`, porém uma instalação existente podia ter o único registro da tabela `admin_users` marcado como `admin`. Isso deixava o administrador original preso fora da tela **Usuários**, mesmo sendo a única pessoa autorizada no banco.

## Correção aplicada

- O servidor agora detecta, de forma restrita, quando existe **exatamente um** administrador cadastrado.
- Se esse único administrador for o usuário logado e estiver como `admin`, o backend atualiza o papel para `owner` automaticamente usando a chave de serviço do Supabase.
- Essa elevação automática deixa de ser possível assim que houver dois ou mais administradores.
- A migration do Gerenciador de Usuários foi ajustada para não transformar indiscriminadamente todos os admins existentes em owners.
- Foi adicionada uma migration de reparo (`20260926_corrige_owner_inicial.sql`) que garante pelo menos um owner em instalações antigas.

## SQL rápido para corrigir o banco que já está no ar

No Supabase, abra **SQL Editor > New query**, cole o conteúdo de:

`supabase/migrations/20260926_corrige_owner_inicial.sql`

e clique em **Run**.

Para conferir:

```sql
select user_id, email, nome, role, criado_em
from public.admin_users
order by criado_em asc;
```

O único usuário existente deve aparecer com `role = owner`.
