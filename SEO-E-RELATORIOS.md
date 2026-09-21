# Relatórios e SEO — Achado do Alê

## 1. Ativar o relatório completo

No Supabase:

1. Abra **SQL Editor**.
2. Crie uma nova query.
3. Cole todo o conteúdo de `supabase/analytics.sql`.
4. Clique em **Run**.

Depois do deploy, o site começa a registrar acessos novos. O SQL não recupera acessos anteriores.

O painel **Admin > Relatórios** passa a mostrar:

- visitantes online nos últimos 2 minutos;
- visualizações de página;
- visitantes únicos anônimos;
- origem/referrer e UTMs;
- dispositivos;
- páginas mais acessadas;
- cliques de saída para ofertas;
- cliques por loja/categoria;
- campanhas UTM;
- acessos recentes;
- impressão/Salvar como PDF;
- exportação em CSV.

O rastreamento próprio não grava nome, e-mail, telefone ou IP.

## 2. Idade e gênero

Esses dados não são inferidos pelo site. Para obtê-los de forma agregada, use Google Analytics 4 e habilite **Google Signals**. O Google pode mostrar faixas de idade e gênero apenas para parte dos usuários elegíveis e pode aplicar limites mínimos por privacidade.

Na Vercel, adicione:

`NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`

Depois faça um redeploy.

## 3. SEO técnico já incluído

Esta versão contém:

- `robots.txt` dinâmico;
- `sitemap.xml` dinâmico;
- canonical URLs;
- titles e meta descriptions;
- Open Graph/Twitter cards;
- dados estruturados `Product` + `Offer` nas promoções;
- `WebSite` structured data na Home;
- páginas administrativas/login/favoritos bloqueadas para indexação;
- ofertas expiradas fora do sitemap e com `noindex`;
- manifest do site.

## 4. Google Search Console

1. Cadastre `https://achadosdoale.com` no Google Search Console.
2. Faça a verificação do domínio ou use a meta tag.
3. Se usar meta tag, copie somente o conteúdo do token e crie na Vercel:

`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=TOKEN_DO_GOOGLE`

4. Faça redeploy.
5. No Search Console, envie o sitemap:

`https://achadosdoale.com/sitemap.xml`

6. Use **Inspeção de URL** para solicitar indexação da Home e das principais páginas de oferta.

A indexação depende do Google e não é instantânea.

## 5. Para identificar melhor WhatsApp, Facebook e campanhas

Links abertos por alguns aplicativos podem chegar sem referrer. Para saber a origem com precisão, use UTMs ao compartilhar:

`https://achadosdoale.com/?utm_source=whatsapp&utm_medium=grupo&utm_campaign=ofertas`

Exemplos de `utm_source`: `whatsapp`, `facebook`, `instagram`, `google`.

### Mostrar idade e gênero dentro do próprio painel

Além do `NEXT_PUBLIC_GA_MEASUREMENT_ID`, a tela de Relatórios já está preparada para consultar a Google Analytics Data API. Para ativar:

1. No Google Cloud, habilite **Google Analytics Data API**.
2. Crie uma **Service Account**.
3. Na propriedade GA4, dê permissão de leitura a esse e-mail da Service Account.
4. Na Vercel, adicione:

- `GA4_PROPERTY_ID` — somente o número da propriedade GA4.
- `GA4_CLIENT_EMAIL` — e-mail da Service Account.
- `GA4_PRIVATE_KEY` — chave privada da Service Account.

5. Faça redeploy.

A tela **Admin > Relatórios** passa a buscar as dimensões `userAgeBracket` e `userGender` automaticamente. Mesmo configurado, o Google pode retornar dados parciais ou nenhum dado quando houver pouco volume ou por limites de privacidade.
