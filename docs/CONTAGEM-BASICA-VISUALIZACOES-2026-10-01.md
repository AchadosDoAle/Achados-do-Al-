# Contagem básica de visualizações — 2026-10-01

## Problema corrigido

Os cliques de saída eram registrados diretamente pelo servidor, mas as visualizações dependiam do aceite do banner de métricas. Isso permitia que o painel mostrasse cliques normalmente enquanto permanecia com `0` visualizações.

## Nova arquitetura

O rastreamento foi separado em duas camadas:

### 1. Contagem operacional básica

Executada em todas as páginas públicas do site.

Registra somente:

- caminho da página;
- data/hora do acesso.

Não cria cookie ou identificador persistente e não envia, nessa trilha, referrer, dispositivo ou parâmetros UTM. As rotas `/admin` e `/login` continuam excluídas.

A gravação usa a RPC `track_basic_pageview(text)` e continua utilizando a tabela `analytics_pageviews` para preservar compatibilidade com o painel web e com consumidores que já contam registros dessa tabela.

### 2. Métricas detalhadas

Continuam condicionadas ao aceite do visitante.

Quando autorizadas, o `AnalyticsTracker` atualiza `analytics_sessions` com informações como:

- origem;
- dispositivo;
- UTMs;
- atividade recente para o indicador online.

O Google Analytics continua obedecendo ao Consent Mode.

## Prevenção de dupla contagem

A RPC `track_analytics_visit(...)` deixa de inserir um segundo registro em `analytics_pageviews`. Ela passa a atualizar somente a sessão detalhada. Dessa forma, quem aceita métricas também gera apenas um pageview operacional por navegação.

## Relatórios administrativos

- **Visualizações**, páginas mais acessadas e acessos por dia usam `analytics_pageviews`.
- **Visitantes com métricas**, origem, dispositivo, campanhas e online usam `analytics_sessions`.
- **CTR** continua comparando cliques de saída com visualizações.

## Arquivos principais

- `components/BasicPageviewTracker.tsx`
- `components/AnalyticsConsentGate.tsx`
- `app/admin/relatorios/page.tsx`
- `app/privacidade/page.tsx`
- `supabase/migrations/20261001_contagem_basica_visualizacoes.sql`
- `supabase/analytics.sql`
