# ACHADOS DO ALÊ — SITE COMPLETO CONSOLIDADO (11/10/2026)

Este ZIP contém o código-fonte completo do site, não apenas um patch.

## Base e atualizações incorporadas

- Versão integral `achado-do-ale-site-principal-lojas-alfabeticas-link-imagem.zip` (base com painel administrativo, cupons, ofertas, categorias, Supabase, e recursos anteriores).
- Correção de interpretação de cupons/Adidas e foto de compartilhamento com correção TypeScript.
- Correção da pesquisa de cupons na página principal e em /cupons.
- Novo visual azul-marinho dos cupons, filtros públicos, estados vencidos, aviso de vencimento e animações sem fade no hover.
- Links de download Android (Play Store) e iOS (página própria EM BREVE com GIF).
- Rodapé social com Instagram e WhatsApp lado a lado.
- Diagnósticos de relatórios de rastreamento e estado do GA4/Data API.

## Para usar

1. Extraia o ZIP e abra a pasta `achado-do-ale` no seu editor.
2. Antes de substituir seu projeto em produção, **faça backup do repositório atual**.
3. Instale as dependências com `npm install`, caso necessário.
4. Configure variáveis de ambiente existentes conforme `.env.example` e suas variáveis na Vercel.
5. Valide com `npm run build` (verificar o script no package.json) antes de publicar.
6. Ao usar GitHub Desktop, confira as diferenças entre a versão atual e este pacote para não perder alterações feitas depois em outra máquina.

## Notas

- Não contém credenciais de produção ou arquivos `.env.local`.
- Não contém os projetos nativos Android ou iOS: este pacote é do SITE WEB.
- A integração Google Analytics Data API depende das credenciais de serviço configuradas no Google Cloud, GA4 e Vercel.
- Nenhum SQL ou alteração no banco Supabase foi executado para preparar o pacote.
