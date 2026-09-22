# Auditoria de profissionalização — Achado do Alê

## Aplicado nesta versão

- autorização real de administrador via `admin_users`
- middleware bloqueando usuários autenticados sem papel de admin
- proteção das APIs administrativas
- remoção da geração de oferta por IA antiga
- sistema de avisos de promoção validado no servidor, com cookie anônimo e limite de abuso
- registro de todos os cliques de saída pelo redirecionador `/r/[id]`
- agendamento salvo explicitamente no horário de Brasília
- cron preparado para execução horária
- Home usando consulta resumida e limite de segurança
- carregamento preguiçoso de imagens dos cards
- busca normalizada sem acentos
- filtros rápidos: cupom, frete grátis, Pix e somente ativas
- favoritos usando o mesmo conversor e regra de expiração do restante do site
- relatórios contabilizando vencimento por data e com acessos/cliques por dia
- exportação CSV incluindo demografia quando o GA4 estiver disponível
- páginas SEO individuais para categorias
- Breadcrumb structured data nas ofertas
- imagem Open Graph dinâmica por promoção
- CTA de compra fixo no mobile
- páginas Sobre, Afiliados, Privacidade e Termos
- consentimento para métricas/GA4
- observações internas deixaram de ser exibidas na página pública
- headers HTTP básicos de segurança
- documentação reorganizada em `docs/`
- `tsconfig.tsbuildinfo` removido do projeto e ignorado pelo Git
- migration de profissionalização consolidada

## Observações

O projeto continua usando Next.js + Supabase + Vercel, sem reescrita desnecessária da arquitetura.
