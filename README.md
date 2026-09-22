# Achado do Alê

Plataforma Next.js + Supabase para publicação de promoções e cupons.

## Desenvolvimento

```bash
npm install
npm run dev
```

Antes de publicar uma alteração importante:

```bash
npm run typecheck
npm run build
```

## Estrutura principal

- `app/` — páginas e rotas do Next.js
- `components/` — interface pública e administrativa
- `lib/` — acesso ao Supabase, parsers e utilitários
- `supabase/` — SQL de instalação e migrations
- `docs/` — histórico de alterações

## Segurança

O painel `/admin` exige autenticação e presença em `public.admin_users`. APIs administrativas também validam esse papel.

## Atualização de profissionalização

Leia `PASSO-A-PASSO-PROFISSIONALIZACAO.txt` antes do deploy.
