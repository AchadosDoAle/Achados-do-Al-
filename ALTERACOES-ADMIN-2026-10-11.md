# Atualização do painel administrativo

- Dashboard reorganizado com cartões de ofertas e cupons e seis atalhos.
- Tela de cupons: compartilhamento individual, cópia de texto, marcar vencido, arquivar, reativar e filtros de status.
- Integração WhatsApp Cloud API removida do menu administrativo; as rotas legadas permanecem no projeto para evitar remoções destrutivas sem auditoria de dependências.
- Mantido Google Analytics Web G-NEQW6KW18Q da versão de backup corrigida.

## Atenção

As ações de cupons reutilizam as colunas existentes `ativo` e `validade` do Supabase. Ao marcar vencido, a validade é substituída por uma data passada; ao reativar, a validade é removida. Faça backup do banco se precisar preservar a validade original. Arquivar usa `ativo=false`. Não é necessário SQL adicional.

## Publicação

Substitua os arquivos do repositório pelos deste ZIP, revise o diff no GitHub Desktop, faça commit e push. Aguarde o deploy da Vercel e teste com uma conta administrativa. Não foi possível concluir um build local com dependências neste ambiente; valide com `npm install` e `npm run check` antes de publicar.
