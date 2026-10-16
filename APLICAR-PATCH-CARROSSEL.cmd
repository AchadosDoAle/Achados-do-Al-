@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ACHADOS DO ALE - CARROSSEL DE 5 OFERTAS
if not exist package.json (
  echo ERRO: coloque TODOS os arquivos deste ZIP na pasta principal do site, junto ao package.json.
  pause
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo ERRO: Node.js nao foi encontrado no PATH.
  pause
  exit /b 1
)
node "%~dp0AplicarPatch.cjs"
if errorlevel 1 (
  echo.
  echo O instalador interrompeu a aplicacao para proteger seu projeto.
  pause
  exit /b 1
)
echo.
echo Confira as mudancas no GitHub Desktop.
pause
