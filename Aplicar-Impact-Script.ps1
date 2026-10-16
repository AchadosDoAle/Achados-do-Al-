# Execute na raiz do projeto (onde esta package.json).
$ErrorActionPreference = 'Stop'
$arquivo = @('app/layout.tsx','src/app/layout.tsx') | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $arquivo) { throw 'Nao encontrei app/layout.tsx ou src/app/layout.tsx.' }
$caminho = (Resolve-Path $arquivo).Path
$original = [IO.File]::ReadAllText($caminho)
$novo = $original

# Remove a verificacao antiga, independentemente de aspas simples/duplas.
$novo = [regex]::Replace($novo, '(?im)^[ \t]*<meta\b(?=[^>]*\bname\s*=\s*["'']impact-site-verification["''])[^>]*\/?>[ \t]*\r?\n?', '')
# Evita instalar o rastreador duas vezes.
if ($novo -match 'utt\.impactcdn\.com/P-A7982813-36c6-4d24-8deb-feba17dc957b1\.js') {
  Write-Host 'O script Impact ja consta no layout. A meta antiga foi removida, se existia.'
} else {
  $script = @'
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7982813-36c6-4d24-8deb-feba17dc957b1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`
          }}
        />
'@
  $head = [regex]::Match($novo, '<head(?:\s[^>]*)?>', 'IgnoreCase')
  if ($head.Success) {
    $novo = $novo.Insert($head.Index + $head.Length, "`n$script")
  } else {
    $html = [regex]::Match($novo, '<html\b[^>]*>', 'IgnoreCase')
    if (-not $html.Success) { throw 'Nao encontrei <html> no layout. Nenhuma alteracao realizada.' }
    $novo = $novo.Insert($html.Index + $html.Length, "`n      <head>`n$script`n      </head>")
  }
}
if ($novo -eq $original) { Write-Host 'Nenhuma alteracao necessaria.'; exit 0 }
$backup = "$caminho.impact.bak"
[IO.File]::Copy($caminho, $backup, $true)
[IO.File]::WriteAllText($caminho, $novo, (New-Object Text.UTF8Encoding($false)))
Write-Host "Impact atualizado em $arquivo. Backup: $backup"
