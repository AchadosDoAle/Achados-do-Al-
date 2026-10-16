# Achados do Alê — Site atualizado para Build 30 (15/10/2026)

## O que foi alterado

- Nova página pública `https://achadosdoale.com/excluir-conta`, com login Google independente do administrativo, identificação da conta, confirmação em duas etapas e exclusão via Edge Function.
- Nova versão **protegida** da função `supabase/functions/delete-my-account/index.ts`. Ela consulta `public.admin_users` com a service role ANTES de excluir. Bloqueia user_id e e-mail administrativo; falhas de consulta bloqueiam exclusão (fail closed).
- Link para exclusão de conta no rodapé, e aviso na Política de Privacidade.
- Convite de instalação não aparece quando o navegador confirmar a instalação do Android. O botão do rodapé usa o esquema `achadodoale://` do app. Web manifest já tinha `related_applications`; foi preservado.
- Gerador para publicar o vínculo entre o site e o Android com a chave de ASSINATURA da Play Store.
- Não houve alteração em `/login`, `/admin`, middleware, usuários, senhas ou permissões do administrativo.

## ETAPA 1 — MUITO IMPORTANTE: corrigir a Edge Function JÁ PUBLICADA

**O código que você publicou anteriormente não bloqueia administradores. Não deixe essa versão antiga disponível.**

1. Abra https://supabase.com/dashboard/project/wpayejnkyvtieywpawik/functions.
2. Clique na função `delete-my-account` (já criada).
3. Abra a aba **Code** e procure o botão para editar o código. Dependendo da versão da interface, pode ser **Edit** ou **Open Editor**.
4. Abra neste novo ZIP o arquivo `supabase/functions/delete-my-account/index.ts`.
5. Copie TODO o conteúdo e substitua TODO o código antigo da função. Não use o `delete-my-account-Build30.ts` anterior.
6. Clique em **Deploy / Deploy updates / Save and deploy**. Verifique o status de implantação e os logs.
7. Na aba **Settings**, preserve `Verify JWT with legacy secret` habilitado enquanto usar a ANON KEY JWT compatível do projeto. A função também valida o usuário dentro do código.
8. **NÃO clique em Test com uma conta real ou administrativa.** Teste apenas com uma conta Google descartável. Depois de excluir a conta de teste, confirme em Authentication > Users que sumiu.
9. Nenhuma chave `service_role` deve ser colocada no site público ou Android; só nas variáveis internas da função.

**Segurança:** esta função bloqueia qualquer pessoa cadastrada em `admin_users`, inclusive `owner`, e também e-mails relacionados a administradores. Se não conseguir ler essa tabela, ela NÃO exclui a conta. Isso é deliberado.

## ETAPA 2 — Autorizar o retorno OAuth no Supabase

1. Abra Supabase → Authentication → URL Configuration:
   https://supabase.com/dashboard/project/wpayejnkyvtieywpawik/auth/url-configuration
2. Em **Redirect URLs / Additional Redirect URLs**, adicione, SEM remover os outros:
   `https://achadosdoale.com/excluir-conta`
   `achadodoale://auth/callback`
3. Salve. Se o site atender com `www` e redirecionar, priorize o domínio final publicado (`https://achadosdoale.com`).
4. Confirme em Authentication → Providers → Google que o login está ativado e Client IDs possui o ID Google OAuth (terminado em `.apps.googleusercontent.com`).
5. No Google Cloud, caso o OAuth esteja em testes, adicione seu próprio Gmail na lista de testadores para permitir login.
6. IMPORTANTE: a página de exclusão usa storage isolado, **não interfere na sessão/cookies** usados por `/login` e `/admin`.

## ETAPA 3 — Atualizar o site usando GitHub Desktop

**Se estiver aplicando o PATCH** (mais seguro para seu repositório existente):

1. Faça backup da pasta atual do seu site.
2. Extraia o `PATCH-SITE-EXCLUSAO-SEGURA-APP-INSTALADO.zip`.
3. Abra sua pasta original do repositório do site (onde está `package.json` e `.git`).
4. Copie todas as pastas e arquivos extraídos de `PATCH` para DENTRO da pasta original do site, aceitando substituir apenas os arquivos solicitados.
5. Abra GitHub Desktop. Revise a lista de arquivos alterados.
6. No campo Summary, use: `feat: exclusão de conta protegida e integração app-site`.
7. Clique **Commit to main** e **Push origin**. Aguarde o deploy no serviço de hospedagem do site.

**Se usar o ZIP COMPLETO**, copie o conteúdo dele para a pasta que você já usa com GitHub Desktop. O ZIP não inclui `.git` nem credenciais. Não apague a pasta `.git` do seu repositório original.

## ETAPA 4 — Verificar a página nova

1. Quando o site for publicado, abra `https://achadosdoale.com/excluir-conta` no navegador.
2. Deve aparecer a explicação pública e o botão **Continuar com Google**.
3. Entre com a **conta Google de teste**, não com a conta administrativa.
4. Confira que o e-mail mostrado é o da conta de teste.
5. Teste a exclusão de conta descartável, digitando `EXCLUIR` e marcando a confirmação.
6. Confirme no Supabase → Authentication → Users e, se a tabela de preferências estiver instalada, que a conta e os dados vinculados foram removidos conforme esperado.
7. Teste `https://achadosdoale.com/login` e o painel `https://achadosdoale.com/admin` com suas credenciais antigas. O código desses caminhos não foi alterado.

## ETAPA 5 — Fazer o Chrome reconhecer o aplicativo instalado

1. Abra Google Play Console → Achados do Alê → **Integridade do app** → **Assinatura de apps**.
2. Copie a impressão digital SHA-256 **do certificado da chave de assinatura do aplicativo** (não da chave de upload).
3. No Windows, abra a pasta do site no Explorador, digite `powershell` na barra de endereço e dê Enter.
4. Execute, substituindo as reticências pela SHA-256 COMPLETA da Play Console:
   `node scripts/gerar-assetlinks.cjs "AA:BB:CC:...:FF"`
5. Verifique o arquivo criado em `public/.well-known/assetlinks.json` e faça o commit/push pelo GitHub Desktop.
6. No celular, abra `https://achadosdoale.com/.well-known/assetlinks.json`: deve abrir o JSON direto, com status 200, sem redirecionar.
7. Instale o Android público **2.3 / Build 30** (que contém a declaração do domínio) e abra `https://achadosdoale.com` pelo **Chrome Android**, não pelo computador.
8. O banner do site deve exibir **Abrir app** se a API do navegador confirmar a instalação; caso contrário, será exibida uma alternativa como Instalar ou Ver app. Outros navegadores podem não suportar a detecção.
9. O popup antigo de instalação foi ajustado para não sugerir instalar quando detectar que o aplicativo já está instalado.

O ZIP não tem uma SHA-256 embutida: ela é exclusiva da chave de assinatura do app publicado. **Não invente a fingerprint.**

## O que foi e não foi testado

- Conferidos arquivos de autenticação do projeto, proteções de roles, sintaxe TypeScript/TSX das mudanças e conteúdo dos arquivos ZIP.
- Não foi possível confirmar uma compilação completa Next.js neste ambiente (dependências não ficaram disponíveis).
- Não foi executada a Edge Function com tokens reais, não houve acesso à sua conta Supabase nem publicação no domínio.
- Depois do deploy, valide a exclusão com uma conta de teste antes de liberar o fluxo de cadastro na Google Play.

## Arquivos alterados

- `app/excluir-conta/page.tsx` (novo)
- `supabase/functions/delete-my-account/index.ts` (novo: código protegido para republicar)
- `scripts/gerar-assetlinks.cjs` (novo)
- `components/Footer.tsx`
- `app/privacidade/page.tsx`
- `components/AppInstallPrompt.tsx`
- `components/AndroidAppFooterBanner.tsx`
- `app/robots.ts`
