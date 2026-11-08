# Preview do WhatsApp — estado estável confirmado

**Data:** 08/11/2026  
**Commit funcional confirmado:** `12515e7f7d6559c1ac828c575b01f790b58619b1`

## O que resolveu

A prévia voltou a funcionar quando o site passou a usar, em conjunto:

1. uma rota pública de imagem em `/preview/oferta/[code]`, fora de `/api`;
2. tentativa de buscar a foto real do produto nessa rota;
3. fallback de imagem válido caso a loja/CDN bloqueie a foto;
4. link curto versionado com `?v=...`, para evitar que o WhatsApp reutilize um preview antigo quebrado.

## O que não funcionou

Durante os testes, não resolveram de forma confiável:

- trocar apenas a ordem das imagens Open Graph;
- usar somente a foto externa da loja;
- usar somente a rota `/api/preview/oferta/[code]`;
- alterar o robô do WhatsApp para tentar compensar um preview quebrado no site;
- depender apenas de esperar mais tempo antes do envio.

## Regra para futuras alterações

Antes de mexer no robô, testar o link manualmente no WhatsApp.  
Se o link manual estiver sem miniatura, o problema deve ser investigado primeiro no site.

Evitar alterar a estratégia de `og:image`, a rota `/preview/oferta/[code]` e o versionamento do link curto sem criar backup e testar uma oferta nova no WhatsApp.

## Backup

O estado imediatamente anterior à correção final foi preservado na branch:

`backup-before-preview-definitivo-2026-11-08`

