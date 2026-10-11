# Auditoria Google Analytics e SEO — 11/10/2026

## Correção aplicada
- Removido ID GA4 fixo de `app/layout.tsx` (`G-1SHEYDJB40`). Agora a única fonte é `NEXT_PUBLIC_GA_MEASUREMENT_ID`, configurada na Vercel.
- `page_view` inclui o título da página. O rastreador continua respeitando o consentimento já implementado.
- Removidas datas artificiais de atualização das páginas estáticas no sitemap; mantidas datas reais das ofertas.

## Passo obrigatório na Vercel
1. Entre na Vercel > projeto > Settings > Environment Variables.
2. Confira em Google Analytics > Administrador > Fluxos de dados > Web o ID de métricas da propriedade correta (formato G-...).
3. Crie/atualize `NEXT_PUBLIC_GA_MEASUREMENT_ID` com ESSE ID (não copie automaticamente um dos dois IDs conflitantes do backup). Selecione Production.
4. Faça novo deploy (redeploy) depois de salvar, porque NEXT_PUBLIC é incorporada no build.
5. Abra janela anônima, aceite métricas e confira Google Analytics > Relatórios > Tempo real. Visite a home e uma oferta. Aguarde alguns minutos.
6. Em caso de ausência, desative bloqueadores de rastreamento no teste e confira no navegador se `gtag/js?id=G-...` carrega.

## SEO já existente no backup
- Metadados, Open Graph, Twitter cards, canonicals de ofertas, robots.txt, sitemap.xml dinâmico e JSON-LD na home e nas ofertas. Não duplicar essas implementações.

## Próximos passos no Google Search Console
1. Verifique a propriedade do domínio `achadosdoale.com` (DNS na Wix se for necessário).
2. Envie `https://achadosdoale.com/sitemap.xml` em Sitemaps.
3. Inspecione a home e URLs de ofertas para diagnosticar indexação e páginas excluídas.
4. Confira relatórios de Core Web Vitals, páginas e desempenho orgânico.

## Observações
- Não foi possível confirmar o ID correto sem acesso à propriedade GA4.
- O painel interno de visitantes usa coletores próprios e não é automaticamente alimentado pelo Google Analytics. Precisa de auditoria independente se continuar zerado.
- Consentimento recusado impede eventos detalhados no fluxo atual, conforme escolha do visitante.
