# Changelog

## Profissionalização 2026-09-21
- acesso administrativo por função de admin
- APIs administrativas protegidas
- avisos de promoção com validação no servidor e rate limit
- cliques de afiliado registrados em todas as ofertas
- cron de agendamento a cada hora e horário de Brasília
- Home mais leve, busca sem acentos e filtros rápidos
- favoritos usando o mesmo conversor das ofertas
- categorias com páginas SEO próprias
- Open Graph dinâmico por promoção
- CTA fixo no mobile
- páginas Sobre, Afiliados, Privacidade e Termos
- código antigo de geração por IA removido
- SQL de segurança consolidado em supabase/profissionalizacao.sql

## 2026-09-22 — Arquivo de promoções e microinterações
- Home passa a exibir somente ofertas ativas e publicadas.
- Nova página `/perdeu` (“Veja o que já perdeu!”) reúne promoções vencidas/expiradas.
- Categorias também escondem promoções encerradas, mantendo o arquivo separado.
- Painel administrativo ganha atalho “Reativar na Home” para ofertas encerradas.
- Botões, CTAs, navegação e cards receberam hover, feedback de clique, brilho e foco acessível.
- Navegação desktop/mobile ganha acesso ao arquivo de promoções.
