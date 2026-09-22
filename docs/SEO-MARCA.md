# SEO de marca — Achado do Alê

Esta versão reforça a associação entre a marca **Achado do Alê** e o domínio `achadosdoale.com`.

## O que foi adicionado

- `Organization` estruturado na Home;
- `WebSite` estruturado com `name` e `alternateName`;
- `logo` associado à organização;
- `sameAs` para perfis sociais oficiais;
- `SearchAction` apontando para a busca interna;
- nome da marca reforçado em title, Open Graph e rodapé;
- links oficiais das redes exibidos no rodapé quando configurados.

## Configurar as redes na Vercel

Em **Vercel → Environment Variables**, cadastre as URLs completas dos perfis oficiais:

- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_TIKTOK_URL`
- `NEXT_PUBLIC_FACEBOOK_URL`
- `NEXT_PUBLIC_YOUTUBE_URL`
- `NEXT_PUBLIC_X_URL`
- `NEXT_PUBLIC_WHATSAPP_CHANNEL_URL`

Exemplo de valor: `https://www.instagram.com/seu_perfil/`

Não invente perfis: preencha somente redes que realmente pertencem ao Achado do Alê. Depois, faça um novo deploy.

## Depois do deploy

1. Abra `https://achadosdoale.com/`.
2. Use a Inspeção de URL no Search Console.
3. Clique em **Solicitar indexação** da Home.
4. Valide o Schema.org em `https://validator.schema.org/`.
5. Aguarde o Google recrawlear a Home e consolidar o nome da marca.
