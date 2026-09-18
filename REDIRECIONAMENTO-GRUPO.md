# Redirecionamento /grupo

O endereço público:

`https://achadosdoale.com/grupo`

agora responde com redirecionamento temporário HTTP 307 para:

`https://whatsapp.com/channel/0029VbDCazP2UPBJKKFNVo3J`

## O que foi alterado

- Criado `app/grupo/route.ts`, responsável pelo redirecionamento.
- Botão "Entrar no canal" do cabeçalho passou a usar `/grupo`.
- Item "Canal" da navegação mobile passou a usar `/grupo`.
- Botão do canal nas páginas de oferta passou a usar `/grupo`.
- Textos gerados para WhatsApp agora divulgam `https://achadosdoale.com/grupo` em vez da URL longa do canal.

Não é necessário alterar o Supabase nem executar SQL.

Depois de enviar estes arquivos ao repositório, é necessário aguardar/concluir um novo deploy na Vercel. O 404 só desaparece no site publicado depois que a versão com a nova rota estiver em produção.
