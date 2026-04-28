@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0backend"

echo.
echo ============================================
echo   Backend - Spring Boot
echo ============================================
echo   Ruta: %cd%
echo.

mvn clean spring-boot:run

pause
pause
