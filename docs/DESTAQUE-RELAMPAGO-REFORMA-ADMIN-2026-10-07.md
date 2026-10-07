# Destaque imperdível, cupons relâmpago e reforma do cadastro — 2026-10-07

## Site público
- A Home pode receber uma oferta marcada como **Promoção imperdível** no painel.
- O destaque possui validade configurável e nunca pode ultrapassar 24 horas.
- Se não houver destaque ativo, a Home volta automaticamente ao produto publicado mais recentemente.
- A página de cupons possui uma seção **CUPONS RELÂMPAGO**.
- Cupons relâmpago recebem uma microanimação de tremida apenas no hover, respeitando `prefers-reduced-motion`.

## Painel administrativo — ofertas
- Novo switch **Promoção imperdível na Home** com campo de data e hora.
- Ao ativar, o formulário sugere automaticamente 24 horas; a validação impede duração maior.
- A Etapa 1 foi reorganizada em duas colunas no desktop: texto colado à esquerda e prévia à direita.
- Colar via botão ou Ctrl+V executa o reconhecimento automaticamente.
- O parser agora considera **POR** como preço à vista/principal.
- O padrão **DE R$ ...** continua sendo tratado como preço antigo e não confunde `12x de R$ ...` com preço antigo.
- Reconhecimento de tamanho ampliado para `TAMANHO`, `TAM`, `SIZE`, numeração, listas P/M/G/GG e dimensões.
- Novo campo **Observação do preço** para condições adicionais.

## Painel administrativo — cupons
- Novo switch **Cupom relâmpago**.
- Cards administrativos exibem um selo para facilitar a identificação.

## Banco de dados
Novas colunas:
- `offers.preco_observacao text`
- `offers.destaque_imperdivel boolean`
- `offers.destaque_ate timestamptz`
- `coupons.relampago boolean`

A migration também protege o destaque com limite de 24 horas e mantém apenas um destaque ativo por vez.

## IA externa
Nenhuma API de IA foi adicionada. O reconhecimento foi aprimorado localmente para manter o fluxo sem custo, sem chave externa e sem depender de cotas de terceiros.
