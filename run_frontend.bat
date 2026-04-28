@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0frontend"

echo.
echo ============================================
echo   Frontend - Vite
echo ============================================
echo   Ruta: %cd%
echo.

echo Instalando dependencias...
call npm install

echo.
echo Iniciando servidor de desarrollo...
npm run dev

pause
pause
