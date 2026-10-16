@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
 echo Node.js nao encontrado. Instale o Node.js antes de executar este patch.
 pause
 exit /b 1
)
node "CorrigirBuild.cjs"
if errorlevel 1 (
 echo A correcao nao foi concluida. Veja a mensagem acima.
 pause
 exit /b 1
)
echo.
echo Abra o GitHub Desktop, faca commit das alteracoes e das exclusoes de arquivos antigos.
pause
