## 2026-10-01 — Carimbo imutável, Oferta Black e detalhes do produto
## 2026-10-01 — Ajuste da faixa Oferta Black
- A faixa `OFERTA BLACK` passou a ficar ancorada na borda esquerda da imagem da promoção, tanto nos cards públicos quanto na página de detalhes.
- O selo de percentual de desconto continua no canto superior direito, evitando sobreposição e melhorando a leitura no mobile.


- Ofertas passam a tratar `publicado_em` como carimbo imutável da primeira publicação; republicações preservam a data.
- Cupons ganham `publicado_em` com proteção por trigger no Supabase.
- Datas de postagem aparecem de forma discreta nas páginas públicas e nas listagens administrativas.
- Nova opção administrativa **Oferta Black Friday**, persistida em `offers.oferta_black`.
- Ofertas marcadas exibem faixa preta **OFERTA BLACK** com texto dourado, desenhada em CSS.
- Marca, modelo, cor, tamanho, voltagem e capacidade passam a aparecer na página pública quando preenchidos.
- No desktop, as características ficam abaixo da foto; no mobile, aparecem em bloco compacto junto às informações do produto.
- Pesquisa administrativa passa a percorrer o histórico em lotes, incluindo registros além do limite padrão de 1.000 linhas do PostgREST.
- Migration `20261001_carimbo_black_friday.sql` adicionada sem apagar dados existentes.

## 2026-10-01 — Frete grátis com MELI+ e Amazon Prime

- Adicionados dois radio buttons opcionais no cadastro de ofertas: **MELI+** e **AMAZON PRIME**.
- Selecionar uma das opções ativa **Frete grátis** e preenche automaticamente **Detalhes do frete grátis**.
- O campo permanece editável para condições manuais e nenhuma das opções é obrigatória.
- Adicionado comando **Limpar seleção** para voltar ao estado sem benefício pré-selecionado.
- Desmarcar Frete grátis remove somente condições automáticas MELI+/Amazon Prime, preservando textos manuais.
- Nenhuma alteração de banco de dados é necessária; o fluxo reutiliza `freteCondicao`.

## 2026-10-01 — Contagem básica de visualizações independente do consentimento

- Corrigido o cenário em que o painel podia exibir cliques normalmente, mas `0` visualizações quando visitantes não aceitavam métricas avançadas.
- Novo `BasicPageviewTracker` registra somente página + horário nas rotas públicas, sem criar identificador persistente.
- Rotas `/admin` e `/login` continuam fora da contagem.
- `track_basic_pageview(...)` grava os pageviews operacionais em `analytics_pageviews`, mantendo compatibilidade com relatórios existentes.
- `track_analytics_visit(...)` passa a atualizar apenas sessões detalhadas, evitando dupla contagem quando o visitante aceita métricas.
- Origem, dispositivo, campanhas UTM, presença online e Google Analytics continuam condicionados ao consentimento.
- Relatório web atualizado para separar visualizações operacionais de métricas detalhadas.
- Política de Privacidade e banner de consentimento atualizados para refletir a nova separação.
- Migration `20261001_contagem_basica_visualizacoes.sql` adicionada sem apagar dados históricos.

## 2026-09-26 — Paginação no admin de ofertas e cupons

- Listagens administrativas passam a exibir no máximo **30 cards por página**.
- A listagem normal agora consulta somente os 30 registros da página atual no Supabase, reduzindo tráfego, renderização e peso do DOM.
- Contagem total usa `count: exact` e paginação por intervalo (`range`) no PostgREST/Supabase.
- Controles de **Anterior**, páginas numeradas e **Próxima** foram adicionados ao final das listagens.
- Em dispositivos móveis, a paginação usa versão compacta com indicador `página/total`.
- A pesquisa continua ignorando acentos e aceitando partes do texto; seus resultados também são divididos em páginas de 30 cards.
- Ao excluir, duplicar, publicar ou republicar uma oferta, a página atual é recarregada sem voltar desnecessariamente ao início.

## 2026-09-26 — Publicar e republicar direto da lista administrativa

## 2026-09-26 - Layout compacto no admin de ofertas e cupons

- Em telas de tablet/desktop, título e ação principal ficam ao lado do campo de pesquisa, reduzindo espaço vertical.
- Em dispositivos móveis, o layout continua empilhado e confortável para toque.
- Grade de ofertas e cupons passa a usar duas colunas a partir de telas grandes (`lg`), aproveitando melhor notebooks e desktops.
- Cards recebem espaçamento interno e vertical ligeiramente menores apenas fora do mobile.


- Ofertas em `rascunho` ganham botão **PUBLICAR** ao lado de **Excluir**.
- Ofertas `expiradas`, `arquivadas` ou com validade vencida ganham botão **REPUBLICAR** ao lado de **Excluir**.
- A publicação/republicação acontece direto na listagem, sem precisar abrir a tela de edição.
- Ao republicar uma oferta cuja validade já passou, a validade antiga é removida para evitar que ela continue aparecendo como vencida.
- Ofertas expiradas por avisos de visitantes zeram os avisos anteriores antes de voltar ao ar.
- A republicação remove agendamento pendente e mantém os demais dados; a partir da atualização de 01/10/2026, `publicado_em` preserva a primeira publicação.


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

## 2026-09-26 — Pesquisa nas listagens administrativas

- Adicionado campo de pesquisa na listagem de **Ofertas** do painel administrativo.
- Adicionado campo de pesquisa na listagem de **Cupons** do painel administrativo.
- A pesquisa pode ser executada pelo botão **Pesquisar** ou pela tecla **Enter**.
- A busca ignora acentos, maiúsculas/minúsculas e pontuação.
- É possível pesquisar usando apenas parte do texto; vários termos podem ser combinados.
- Ofertas podem ser encontradas por título, loja, categoria, marca, modelo, cupom, status e outros dados cadastrados.
- Cupons podem ser encontrados por código, loja, descrição, desconto, status e demais informações cadastradas.
- Resultado da busca mantém os mesmos botões de edição, exclusão, publicação e republicação da listagem normal.

## 2026-09-28 — Reconhecimento de ofertas, categorias, imagens e compartilhamento

- Reconhecimento de preços ampliado para valores com ou sem centavos, incluindo `DE R$`, `POR R$`, Pix e parcelamento.
- O padrão `DE R$...` passa a ter prioridade explícita para preencher o preço antigo.
- Reconhecimento de título, loja, categoria, marca e modelo reforçado para textos de afiliados e publicações prontas.
- Adicionadas as categorias **Bebidas** e **Cuidados Pessoais**.
- Seletor administrativo de categoria convertido para lista suspensa (`select`), evitando textos estourando os botões.
- Busca automática de imagem reforçada com user-agents sociais, Open Graph, Twitter Cards, JSON-LD, JSON serializado, `srcset`, lazy-loading, redirects HTML/JS, canonical e links de redirecionamento.
- Quando a loja bloqueia o download da imagem, o painel pode usar diretamente a imagem pública descoberta no preview como fallback.
- Compartilhamento de cupons reformulado com nome do cupom em destaque, benefício, loja, validade e link do Achado do Alê.
- Criada rota intermediária curta `/c/CODIGO` para cupons, com Open Graph próprio e redirecionamento para a página externa do cupom.
- Compartilhamento de ofertas reformulado com nome em destaque, preço antigo, menor preço disponível, loja e link curto do site.
- O preço social de ofertas agora usa o menor valor entre preço atual e Pix.

## 2026-09-28 — Login administrativo
- Reformulação visual da tela de login do painel administrativo.
- Correção dos campos de e-mail e senha para manter fundo claro e texto legível mesmo com `color-scheme: dark` global.
- Adição de botão com ícone de olho para mostrar/ocultar a senha.
- Melhoria de foco, placeholders, autofill/autocomplete e mensagens de erro/recuperação.

## 2026-09-28 — Ajuste do ícone de senha no login administrativo
- Reduzido o botão de mostrar/ocultar senha para 28x28 px.
- Ícone centralizado verticalmente dentro do campo, sem ultrapassar os limites do input.
- Reduzido o ícone do olho para 16x16 px e ajustado o espaço interno do campo de senha.

## 2026-09-28 — Ajuste do botão de visibilidade da senha

- Mantém o botão do olho fixo e centralizado dentro do campo de senha.
- Remove o deslocamento vertical herdado da animação global de botões.
- Mantém apenas uma interação sutil de cor/sombra no hover e leve escala no clique.

## 2026-10-01 - Atualizacao ao vivo da vitrine publica
- Adicionado listener global do Supabase Realtime para `offers` e `coupons`.
- Paginas publicas passam a receber novas publicacoes e alteracoes sem recarregar o navegador.
- Atualizacao usa `router.refresh()` do Next.js, evitando reload completo da pagina.
- Pagina de categoria marcada com `revalidate = 0` para garantir dados atuais em cada refresh.
- Favoritos refaz sua consulta quando uma oferta recebe alteracao em tempo real.
- Adicionada sincronizacao ao retornar para uma aba que ficou em segundo plano.
- Listener fica desativado em `/admin` e `/login` para nao interferir em formularios administrativos.
- Adicionada migration idempotente para habilitar `offers` e `coupons` na publication `supabase_realtime`.
