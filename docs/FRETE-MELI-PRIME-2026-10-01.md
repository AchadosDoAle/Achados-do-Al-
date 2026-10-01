# Frete grátis — MELI+ e Amazon Prime

Atualização do formulário administrativo de ofertas em 01/10/2026.

## O que mudou

- O bloco **Frete grátis** continua opcional.
- Foram adicionadas duas opções em radio button:
  - **MELI+**
  - **AMAZON PRIME**
- Nenhuma das duas opções é obrigatória.
- Ao selecionar **MELI+**, o campo **Detalhes do frete grátis** é preenchido automaticamente com `MELI+`.
- Ao selecionar **AMAZON PRIME**, o campo **Detalhes do frete grátis** é preenchido automaticamente com `AMAZON PRIME`.
- A seleção também ativa automaticamente a opção **Frete grátis**.
- O campo continua editável manualmente para outras condições, como valor mínimo de compra.
- Quando uma condição manual diferente é digitada, nenhum dos dois radios fica marcado.
- Foi incluído o comando **Limpar seleção** para retirar MELI+/Amazon Prime sem tornar a escolha obrigatória.
- Ao desmarcar **Frete grátis**, uma condição automática `MELI+` ou `AMAZON PRIME` é removida; condições manuais são preservadas.

## Banco de dados

Nenhuma migration ou alteração de banco é necessária. A implementação reutiliza o campo já existente `freteCondicao`.
