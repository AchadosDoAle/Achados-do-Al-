# Carimbo de postagem, Oferta Black e detalhes do produto — 2026-10-01

## Carimbo de postagem imutável

- Ofertas usam `offers.publicado_em` como data da primeira publicação.
- Republicações não alteram mais esse valor.
- A migration preenche ofertas antigas já publicadas que não tinham `publicado_em` usando `criado_em` como melhor referência histórica disponível.
- Cupons passam a ter `coupons.publicado_em`, preenchido na criação e protegido por trigger.
- Os formulários administrativos não oferecem edição do carimbo.
- A página pública do produto mostra `OFERTA POSTADA EM: DD/MM/AAAA` de forma discreta.
- Cards/página pública de cupons mostram `CUPOM POSTADO EM: DD/MM/AAAA` de forma discreta.

## Oferta Black Friday

- Nova coluna `offers.oferta_black boolean` com padrão `false`.
- O cadastro/edição de oferta ganhou um switch opcional **Oferta Black Friday**.
- Quando ativo, a página pública da oferta e os cards públicos exibem uma faixa preta com texto dourado `OFERTA BLACK` abaixo do percentual de desconto quando ele existir.
- A faixa é desenhada com CSS; nenhuma imagem fixa do exemplo foi incorporada.

## Características do produto

Quando houver valor cadastrado, a página pública passa a exibir:

- Marca
- Modelo
- Cor
- Tamanho
- Voltagem
- Capacidade

No desktop, o bloco aparece abaixo da foto. No mobile, aparece em posição compacta junto às informações da oferta, depois de preço/frete e antes de cupom/ações.

## Pesquisa administrativa

A pesquisa administrativa de ofertas e cupons agora busca os registros em lotes de até 1.000 itens até atingir o fim da tabela. Isso remove a limitação silenciosa do PostgREST/Supabase que fazia promoções antigas não aparecerem nos resultados quando o histórico crescia.

A listagem normal continua paginada em 30 cards por tela; a carga histórica completa acontece somente quando uma pesquisa é executada.
