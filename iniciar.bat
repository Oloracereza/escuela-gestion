@echo off
title Sistema Escolar - Arranque
color 0A

echo ============================================
echo   Sistema de Gestion Escolar
echo ============================================
echo.

:: ---------- MySQL ----------
echo [1/3] Verificando MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I "mysqld.exe" >NUL
if %ERRORLEVEL% EQU 0 (
    echo        MySQL ya esta corriendo.
) else (
    echo        Iniciando MySQL...
    start "" /B "C:\xampp\mysql\bin\mysqld.exe" "--defaults-file=C:\xampp\mysql\bin\my.ini" "--standalone"
    timeout /T 6 /NOBREAK >NUL
    echo        MySQL iniciado.
)

:: ---------- Backend ----------
echo [2/3] Iniciando Backend (Spring Boot)...
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%
set MVN=C:\Users\Lauro Valdez\Documents\Maven\apache-maven-3.9.9\bin\mvn.cmd

start "Backend - Spring Boot" /D "C:\Users\Lauro Valdez\Documents\escuela-gestion\backend" cmd /k "set JAVA_TOOL_OPTIONS= && set JAVA_HOME=C:\Program Files\Java\jdk-17 && set PATH=%JAVA_HOME%\bin;%PATH% && %MVN% spring-boot:run"
echo        Backend arrancando (espera ~30 segundos)...
timeout /T 30 /NOBREAK >NUL

:: ---------- Frontend ----------
echo [3/3] Iniciando Frontend (React)...
start "Frontend - Vite" /D "C:\Users\Lauro Valdez\Documents\escuela-gestion\frontend" cmd /k "npm run dev -- --host 0.0.0.0"
timeout /T 8 /NOBREAK >NUL

:: ---------- Abrir navegador ----------
echo.
echo ============================================
echo   Todo listo. Abriendo navegador...
echo   URL: http://localhost:3000
echo   En otra computadora de la misma red: http://IP-DE-ESTA-PC:3000
echo   API directa en red local: http://IP-DE-ESTA-PC:8080/api
echo   Usuario admin por defecto (solo desarrollo local):
echo   Ver/editar en backend\src\main\resources\application.properties
echo   (app.admin.email / app.admin.password, o variables de entorno
echo    ADMIN_EMAIL / ADMIN_PASSWORD)
echo ============================================
echo.
start "" http://localhost:3000

pause
