# Melhorias no cadastro rápido de ofertas — 2026-09-26

Esta atualização foi feita para reduzir erros no cadastro de promoções quando o painel é usado com pressa.

## Categorias

- Lista ampliada para 34 categorias administrativas.
- Inclusão de novas opções como Acessórios, Brinquedos, Eletrônicos, Eletroportáteis, Jardim, Relógios e Viagem.
- Categorias exibidas em ordem alfabética.
- O seletor antigo foi substituído por uma lista de radio buttons pesquisável.
- Campo de busca ignora acentos, facilitando pesquisas como `relogio` -> `Relógios`.
- Novas ofertas começam sem categoria padrão. Se a leitura automática falhar, o usuário precisa escolher uma categoria antes de salvar, evitando que uma oferta seja cadastrada silenciosamente na categoria errada.

## Reconhecimento automático de categoria

- O reconhecimento passou a usar um sistema de pontuação por palavras-chave.
- O nome do produto tem peso maior do que o restante do texto, reduzindo falsos positivos causados por chamadas promocionais, benefícios e rodapés.
- Foram adicionadas regras específicas para celulares, relógios, brinquedos, eletrônicos, eletroportáteis, áudio, informática, casa, móveis, beleza, perfumaria, ferramentas, suplementos e outras categorias.
- Quando houver uma linha explícita `Categoria: ...`, o painel tenta respeitar o valor informado se ele existir na lista administrativa.

## Reconhecimento de marca

- Adicionada detecção automática por uma lista ampliada de marcas conhecidas.
- A busca da marca prioriza o título do produto, evitando confundir nome de loja, link ou rodapé com a marca.
- Famílias como iPhone, Galaxy, Moto e Redmi só são usadas para inferir a marca quando a categoria torna essa associação segura. Exemplo: `capa para iPhone` não é cadastrada automaticamente como marca Apple.

## Reconhecimento de modelo

- Continua aceitando linhas explícitas como `Modelo:` e `Referência:`.
- Também tenta reconhecer famílias e códigos de modelos dentro do título, como Galaxy A55 5G, iPhone 16 Pro Max, Galaxy Watch, Moto G, Redmi Note, JBL Tune/Flip e códigos alfanuméricos ligados a marcas conhecidas.
- Especificações comuns, como 1080P, 256GB e voltagem, não são tratadas isoladamente como modelo.
- Quando não houver segurança suficiente, o modelo permanece vazio para revisão manual.

## Avisos de revisão

- Após colar/reconhecer uma oferta, Categoria, Marca e Modelo que não forem identificados recebem destaque visual em amarelo.
- O painel informa claramente quais desses campos precisam ser conferidos.
- Categoria continua obrigatória; Marca e Modelo permanecem opcionais, pois existem produtos sem essas informações.
