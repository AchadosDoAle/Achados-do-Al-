# Patch: convite de instalação do app

- Android: painel compacto no rodapé após 3,5 segundos, com link da Google Play já usado no Footer.
- O convite não aparece em desktop e não aparece em modo standalone.
- Botões Fechar e Agora não ocultam o painel por 14 dias no mesmo navegador.
- iOS: detecção implementada, mas `IOS_PROMPT_ENABLED = false` e `IOS_URL` vazio; nada aparece até habilitação explícita.
- O painel fica acima da navegação inferior móvel e respeita a área segura do dispositivo.
- Arquivos alterados: `app/layout.tsx`; novo `components/AppInstallPrompt.tsx`.
- Nenhuma alteração de banco de dados.

Para ativar iOS futuramente: preencher `IOS_URL` com a URL oficial da App Store e alterar `IOS_PROMPT_ENABLED` para `true` em `components/AppInstallPrompt.tsx`.

Commit sugerido: `feat: adiciona convite discreto do app no Android e prepara iOS`
