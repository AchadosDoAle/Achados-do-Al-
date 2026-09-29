# Melhorias de reconhecimento e compartilhamento — 28/09/2026

## Cadastro de ofertas

- O parser de texto aceita preços brasileiros com ou sem centavos.
- `DE R$...` é a referência prioritária para **Preço antigo**.
- `POR R$...` é usado como preço atual e menções explícitas a Pix alimentam o campo de Pix.
- Foram ampliadas as regras de reconhecimento de loja, produto, categoria, marca e modelo.
- Novas categorias: **Bebidas** e **Cuidados Pessoais**.
- A categoria no painel usa uma lista suspensa com seta, em ordem alfabética.

## Imagens automáticas

O endpoint `/api/buscar-imagem` agora tenta reproduzir melhor o comportamento de crawlers sociais, incluindo o WhatsApp/Meta. São analisados:

- `og:image` e Twitter Cards;
- JSON-LD / Schema.org;
- JSON de aplicações Next.js e SPAs;
- `src`, `data-src`, lazy-loading e `srcset`;
- imagens em CSS;
- redirecionamentos HTTP, HTML e JavaScript;
- URL canonical;
- URLs de destino presentes em parâmetros de links de afiliado.

Quando a imagem é encontrada, o sistema tenta copiá-la para o Storage do Supabase. Se a loja permitir o preview, mas bloquear o download pelo servidor, a URL original da imagem passa a ser utilizada como fallback.

## Compartilhamento de cupons

O botão de compartilhamento envia uma mensagem mais visual com:

- nome do cupom em destaque;
- percentual ou benefício do cupom;
- loja;
- validade;
- link do Achado do Alê.

Foi criada a rota `/c/CODIGO`, que exibe uma página intermediária do Achado do Alê, fornece metadados Open Graph próprios e depois redireciona o visitante para o link externo do cupom.

## Compartilhamento de produtos

A mensagem compartilhada inclui:

- nome do produto em destaque;
- preço antigo, quando houver;
- menor preço disponível entre preço atual e Pix;
- loja;
- link curto do Achado do Alê (`/p/CODIGO`).

A miniatura é fornecida pelos metadados Open Graph da rota curta, priorizando a mesma imagem principal cadastrada no produto.
