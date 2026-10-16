# Execute na raiz do projeto Achados do Ale (onde fica package.json).
# Insere a meta tag exatamente como fornecida, com o atributo value.
$ErrorActionPreference = 'Stop'
$arquivo = @('app/layout.tsx', 'src/app/layout.tsx') | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $arquivo) { throw 'Nao encontrei app/layout.tsx. Execute na pasta raiz do projeto.' }
$original = [System.IO.File]::ReadAllText((Resolve-Path $arquivo).Path)
if ($original.Contains('impact-site-verification')) {
  Write-Host 'A verificacao Impact ja existe. Nenhuma alteracao realizada.'
  exit 0
}
$meta = '<meta name="impact-site-verification" value="4ede9b56-c737-4654-bc16-fe2081d0f782" />'
$quebra = if ($original.Contains("`r`n")) { "`r`n" } else { "`n" }
$head = [regex]::Match($original, '<head(?:\s[^>]*)?>', 'IgnoreCase')
if ($head.Success) {
  $pos = $head.Index + $head.Length
  $alterado = $original.Insert($pos, "$quebra        $meta")
} else {
  $html = [regex]::Match($original, '<html\b[^>]*>', 'IgnoreCase')
  if (-not $html.Success) { throw 'Nao encontrei a tag <html> no layout. Nenhuma mudanca feita.' }
  $pos = $html.Index + $html.Length
  $alterado = $original.Insert($pos, "$quebra      <head>$quebra        $meta$quebra      </head>")
}
$backup = "$arquivo.impact.bak"
[System.IO.File]::Copy((Resolve-Path $arquivo).Path, (Join-Path (Get-Location) $backup), $true)
[System.IO.File]::WriteAllText((Resolve-Path $arquivo).Path, $alterado, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Meta tag Impact inserida em $arquivo. Backup: $backup"
Write-Host 'Depois, revise a alteracao no GitHub Desktop, faca Commit e Push origin.'
