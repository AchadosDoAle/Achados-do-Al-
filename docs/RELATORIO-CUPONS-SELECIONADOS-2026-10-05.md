# Mini relatório de cupons selecionados — 05/10/2026

Alteração exclusiva da versão web administrativa.

## O que foi adicionado
- Checkbox em cada card da página `/admin/cupons`.
- Seleção persistente durante a navegação entre páginas da listagem.
- Botão para selecionar os cupons visíveis na tela.
- Prévia de um relatório textual apenas com os cupons selecionados.
- Botões **Copiar relatório** e **Compartilhar selecionados**.
- Fallback para copiar ao clipboard quando a Web Share API não estiver disponível.
- Links do relatório usam a URL curta `/c/...` do Achado do Alê, preservando o redirecionamento pelo site.

## Formato
```
NOME DO CUPOM - X% DE DESCONTO
OBSERVAÇÕES / TERMOS DE USO - DD/MM/AAAA às HH:MM
https://achadosdoale.com/c/...
--------------------------------------------------------
```

Se o cupom não tiver porcentagem, o sistema usa o campo de valor/benefício do cupom. Se também estiver vazio, informa `DESCONTO NÃO INFORMADO`.

Nenhuma alteração de banco de dados foi necessária. Android, iOS e o aplicativo administrativo Android não foram alterados.
