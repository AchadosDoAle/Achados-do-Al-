# Compartilhamento com link curto e prévia social

## Problema observado
Ao compartilhar uma página de oferta, o WhatsApp podia exibir apenas o domínio e a URL longa, sem nome do produto, preço ou foto.

## Alterações realizadas

1. **Link curto por oferta**
   - Uma oferta com slug como `kit-3-ventoinhas-corsair-rs120-argb-120mm-pwm-q7vw2` pode ser compartilhada como `https://achadosdoale.com/p/q7vw2`.
   - Não foi necessária nenhuma alteração no Supabase: o código curto reaproveita o identificador aleatório que já existe no final do slug.

2. **Texto de compartilhamento mais completo**
   - O botão Compartilhar passa a montar uma mensagem com nome do produto, preço, loja e link curto.
   - Em navegadores sem compartilhamento nativo, a mesma mensagem é copiada para a área de transferência.

3. **Open Graph reforçado**
   - Título social: produto + preço.
   - Descrição social: preço/condição + loja.
   - Primeira imagem social: foto cadastrada da oferta.
   - Fallback: imagem Open Graph gerada pelo próprio site.

4. **Rota curta amigável a robôs de prévia**
   - `/p/[code]` entrega os metadados diretamente para o robô do WhatsApp.
   - Para uma pessoa normal, a página redireciona automaticamente para a página completa da oferta.

## Observação sobre cache do WhatsApp
O WhatsApp pode manter uma prévia antiga em cache por algum tempo. Links curtos novos normalmente forçam uma nova consulta de metadados. Se uma oferta já tiver sido compartilhada antes, a atualização da prévia pode não ser imediata em todos os dispositivos.
