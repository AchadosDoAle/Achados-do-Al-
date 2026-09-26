## 2026-09-26 — Publicar e republicar direto da lista administrativa

- Ofertas em `rascunho` ganham botão **PUBLICAR** ao lado de **Excluir**.
- Ofertas `expiradas`, `arquivadas` ou com validade vencida ganham botão **REPUBLICAR** ao lado de **Excluir**.
- A publicação/republicação acontece direto na listagem, sem precisar abrir a tela de edição.
- Ao republicar uma oferta cuja validade já passou, a validade antiga é removida para evitar que ela continue aparecendo como vencida.
- Ofertas expiradas por avisos de visitantes zeram os avisos anteriores antes de voltar ao ar.
- A republicação atualiza `publicado_em`, remove agendamento pendente e mantém os demais dados da oferta.


## 2026-09-26 — Correção do owner inicial

- Corrigido bloqueio em que o único administrador cadastrado podia permanecer com papel `admin` e ficar sem acesso ao Gerenciador de Usuários.
- Quando existe exatamente um administrador, o backend garante automaticamente que ele seja `owner`.
- Adicionada migration de reparo para bancos já publicados.
- A migration original do Gerenciador de Usuários agora promove somente um owner inicial quando necessário, em vez de elevar todos os admins.

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

## 2026-09-22 — Google Consent Mode v2
- Google tag agora é carregada globalmente para permitir detecção pelo Google/Tag Assistant.
- Consentimento padrão mantém Analytics e publicidade em `denied`.
- Ao aceitar o banner, apenas `analytics_storage` muda para `granted`.
- Tags de publicidade permanecem negadas.
- Pageviews completos continuam sendo enviados apenas após o aceite do usuário.

## 2026-09-26 — Gerenciador de usuários administrativos
- Nova página `/admin/usuarios` para gerenciar quem pode acessar o painel administrativo e o app.
- Dois níveis de permissão: `owner` e `admin`.
- Usuários `owner` podem listar, adicionar, alterar o papel e remover o acesso de outros administradores.
- Criação de usuário pelo painel com senha temporária quando o e-mail ainda não existe no Supabase Auth.
- Contas já existentes no Supabase Auth podem receber acesso administrativo sem troca de senha.
- Proteção para impedir a remoção ou o rebaixamento do último `owner`.
- Novas rotas protegidas em `/api/admin/usuarios` e `/api/admin/usuarios/[id]`.
- `lib/admin-auth.ts` ampliado para identificar o administrador logado e seu papel.
- Migration `20260926_gerenciador_usuarios.sql` adicionada para `nome`, `role`, índice e função `is_owner()`.
- Navegação do painel passa a incluir o atalho “Usuários”.
- Integração preserva o tema atual do painel: fundo cinza-claro e botões mostarda.

## 2026-09-26 — Cadastro rápido: categorias, marca e modelo
- Lista administrativa ampliada para 34 categorias e reorganizada em ordem alfabética.
- Seletor de categoria substituído por radio buttons pesquisáveis, com busca sem acentos.
- Novas ofertas não recebem mais uma categoria padrão silenciosa; se a detecção falhar, a categoria fica vazia e precisa ser escolhida antes de salvar.
- Reconhecimento automático de categoria refeito com pontuação por palavras-chave e maior peso para o título do produto.
- Reconhecimento de marca ampliado com dezenas de marcas conhecidas e regras para evitar inferências indevidas em acessórios.
- Reconhecimento de modelo ampliado para famílias e códigos comuns, ignorando especificações que poderiam ser confundidas com modelo.
- Categoria, Marca e Modelo não reconhecidos recebem aviso visual para revisão antes da publicação.
- Ícones públicos atualizados para as novas categorias.

## 2026-09-26 — Compartilhamento com link curto e prévia social

- Criada rota curta de compartilhamento no formato `/p/CODIGO` usando o código final do slug existente, sem alterar o banco de dados.
- O botão **Compartilhar** agora envia nome do produto, preço, loja e o link curto no próprio texto, evitando mensagens que chegam apenas com a URL.
- Metadados Open Graph das ofertas foram reforçados com título contendo produto + preço e descrição com preço/loja.
- A foto cadastrada do produto passa a ser a primeira imagem social; o card Open Graph gerado pelo site fica como fallback.
- A rota curta possui metadados próprios para WhatsApp, Facebook, Telegram e outros aplicativos de mensagem e redireciona o visitante para a página completa da oferta.
