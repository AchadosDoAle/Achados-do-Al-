@echo off
setlocal
cd /d "%~dp0"
node "Aplicar-Verificacao-Impact.cjs"
if errorlevel 1 (
 echo.
 echo O patch nao foi aplicado. Leia o erro acima ou envie uma captura.
)
echo.
pause
