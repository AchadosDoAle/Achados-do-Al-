# Achado do Alê

Site + painel administrativo para cadastrar, gerar com IA e publicar
ofertas de afiliados (Mercado Livre, Amazon, Magalu, Shopee, Natura, Avon,
Malwee, O Boticário e outras).

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase**
(banco de dados, autenticação e, futuramente, storage de imagens).

## O que existe em cada etapa

1. **Estrutura visual e navegação** — identidade visual, header, busca,
   categorias, cards, navegação inferior.
2. **Cadastro manual** — formulário completo em `/admin/ofertas/nova`.
3. **Banco de dados** — schema em `supabase/schema.sql`, tudo migrado do
   armazenamento local para o Supabase (`lib/offers-repo.ts`).
4. **Geração com IA** — `/api/gerar-oferta`, componente `GerarComIA`,
   estilos e comandos rápidos ("deixa mais engraçado", "faz mais curto"...).
5. **Prévia e edição** — `PreviaWhatsApp`, com "Copiar publicação" e
   "Enviar para WhatsApp" (compartilhamento nativo, 100% oficial).
6. **Publicação no site** — home e página de oferta (`/oferta/[slug]`)
   renderizadas no servidor, com SEO e Open Graph.
7. **Autenticação** — login em `/login`, `middleware.ts` protege tudo
   que é `/admin`, recuperação de senha por e-mail.
8. **Afiliados e rastreamento** — link de redirecionamento opcional
   (`/r/[id]`) que registra o clique antes de mandar para a loja; aviso
   quando o link não bate com o domínio esperado da loja.
9. **Agendamento** — campo de data/hora no formulário + rotina em
   `/api/cron/publicar-agendadas`, chamada pela Vercel (`vercel.json`).
10. **Integração oficial de comunicação** — `/admin/integracoes` mostra o
    status da Cloud API do WhatsApp e o histórico de publicações.
11. **Relatórios** — `/admin/relatorios`: cliques por loja/categoria,
    ofertas mais acessadas, publicações enviadas e com falha.
12. **Produção** — instruções abaixo.

## Como rodar localmente

1. Crie um projeto gratuito em [supabase.com](https://supabase.com), abra o
   **SQL Editor** e rode o conteúdo de `supabase/schema.sql`, e depois
   `supabase/storage.sql` (esse segundo cria o espaço de armazenamento das
   imagens das ofertas).
2. Em **Authentication > Users**, crie o seu usuário (e-mail e senha) —
   esse será o login do painel.
3. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (em
     Project Settings > API).
   - `SUPABASE_SERVICE_ROLE_KEY` (mesma tela — nunca exponha essa chave
     no navegador; ela só é usada em `lib/supabase/admin.ts`).
   - `ANTHROPIC_API_KEY` (em console.anthropic.com) para a geração de texto.
4. Rode:
   ```
   npm install
   npm run dev
   ```
5. Acesse `/login`, entre com o usuário criado no passo 2, e vá em
   "Nova oferta".

## Publicar em produção

1. Suba o projeto num repositório (GitHub, por exemplo) e importe no
   [Vercel](https://vercel.com) (tem plano gratuito).
2. Em **Settings > Environment Variables** do projeto na Vercel, cole as
   mesmas variáveis do `.env.local`, mais `CRON_SECRET` (invente uma senha
   longa aleatória — a Vercel usa isso pra autenticar a rotina de
   agendamento sozinha).
3. **Domínio próprio:** em Settings > Domains na Vercel, adicione o seu
   domínio. A Vercel mostra um registro (CNAME ou A) para você criar no
   painel do lugar onde comprou o domínio (Registro.br, GoDaddy etc.). Leva
   de alguns minutos a algumas horas para propagar.
4. **WhatsApp oficial (opcional):** só é necessário se você quiser enviar
   mensagens automáticas para uma lista de contatos com opt-in. Crie um
   app em developers.facebook.com, ative o produto "WhatsApp", pegue o
   token e o `Phone Number ID`, e preencha `WHATSAPP_TOKEN` e
   `WHATSAPP_PHONE_NUMBER_ID`. Isso **não é necessário** para publicar no
   seu canal — isso já funciona com os botões de copiar/compartilhar.

## Sobre o agendamento automático

O arquivo `vercel.json` chama `/api/cron/publicar-agendadas` a cada 30
minutos. **Atenção:** no plano gratuito (Hobby) da Vercel, cron jobs podem
ficar limitados a uma execução por dia — confira a política atual em
vercel.com/docs/cron-jobs antes de contar com os 30 minutos. Se precisar de
mais precisão sem pagar pelo plano Pro, uma alternativa é criar um
`pg_cron` dentro do próprio Supabase (gratuito), rodando a cada minuto.

## Custos mensais estimados

- **Vercel (Hobby):** gratuito para este volume de tráfego.
- **Supabase (Free):** gratuito até 500 MB de banco e 1 GB de storage —
  suficiente para começar.
- **Domínio:** o custo que você já paga hoje (renovação anual, fora deste
  cálculo mensal).
- **IA (Anthropic):** cobrança por uso; gerar uma publicação custa frações
  de centavo. Para uso moderado (algumas dezenas de ofertas por dia),
  tende a ficar na casa de poucos reais por mês.
- **WhatsApp Cloud API:** as primeiras conversas de cada categoria por mês
  costumam ser gratuitas; acima disso a Meta cobra por conversa iniciada.
  Só entra em jogo se você ativar o envio a contatos opt-in.
- **Total estimado para começar: próximo de R$ 0 a R$ 20/mês**, sem contar
  o domínio que você já possui.

## Limitações conhecidas

- Não existe (nem existirá, de forma oficial) postagem automática no seu
  canal ou em grupos do WhatsApp — é uma limitação da própria Meta, não
  deste sistema.
- A imagem do produto agora tem upload real via Supabase Storage (Etapa
  atualizada) — cada imagem enviada fica guardada e visível para todo
  mundo, tanto no card da home quanto na página da oferta.
- O agendamento automático depende da frequência do cron do seu plano de
  hospedagem.
- A validação de link por domínio é uma checagem simples; não impede 100%
  dos erros de link.
- Não há analytics de audiência do site (só cliques nas ofertas).

## Melhorias futuras sugeridas

- Compressão automática de imagem antes do upload (hoje sobe o arquivo do
  jeito que veio do celular/computador).
- OCR/leitura de prints para preencher o formulário automaticamente.
- Versão para Instagram/Telegram gerada junto com o texto do WhatsApp.
- Envio de e-mail/notificação quando uma publicação agendada falhar.
- Painel de cliques com gráfico por período (não só números).
