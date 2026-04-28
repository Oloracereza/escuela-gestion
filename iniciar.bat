@echo off
title Sistema Escolar - Arranque
color 0A

echo ============================================
echo   Sistema de Gestion Escolar
echo ============================================
echo.

:: Verificar variables de entorno
echo [Verificando entorno...]
where java >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java no se encuentra en el PATH
    echo Por favor instala Java JDK o añade su carpeta bin al PATH
    pause
    exit /b 1
)

where mvn >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven no se encuentra en el PATH
    echo Por favor instala Maven o añade su carpeta bin al PATH
    pause
    exit /b 1
)

where npm >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js/npm no se encuentran en el PATH
    echo Por favor instala Node.js
    pause
    exit /b 1
)

echo   Java: 
java -version 2>&1 | findstr "version"
echo   Maven: 
mvn -version 2>&1 | findstr "Apache"
echo   Node.js:
node --version
echo.

:: ---------- MySQL (Opcional) ----------
echo [1/3] Verificando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I "mysqld.exe" >NUL
if %ERRORLEVEL% EQU 0 (
    echo        MySQL ya esta corriendo.
) else (
    echo        Nota: MySQL no esta corriendo. 
    echo        Asegúrate de que la BD esté disponible o inicia MySQL manualmente.
)

:: ---------- Backend ----------
echo.
echo [2/3] Iniciando Backend (Spring Boot)...
echo        Directorio: %~dp0backend
start "Backend - Spring Boot" "%~dp0run_backend.bat"
echo        Backend arrancando (espera ~30 segundos)...
timeout /T 30 /NOBREAK >NUL

:: ---------- Frontend ----------
echo.
echo [3/3] Iniciando Frontend (React)...
echo        Directorio: %~dp0frontend
start "Frontend - Vite" "%~dp0run_frontend.bat"
timeout /T 8 /NOBREAK >NUL

:: ---------- Abrir navegador ----------
echo.
echo ============================================
echo   Todo listo. Abriendo navegador...
echo   URL: http://localhost:3000
echo   Usuario: admin@escuela.com
echo   Password: admin123
echo ============================================
echo.
timeout /T 3 /NOBREAK
start "" http://localhost:3000

pause
