@echo off
title Sistema Escolar - Detener
color 0C

echo ============================================
echo   Deteniendo Sistema de Gestion Escolar
echo ============================================
echo.

echo Deteniendo Frontend (node)...
taskkill /F /IM node.exe >NUL 2>&1
echo Hecho.

echo Deteniendo Backend (java)...
taskkill /F /IM java.exe >NUL 2>&1
echo Hecho.

echo Deteniendo MySQL...
taskkill /F /IM mysqld.exe >NUL 2>&1
echo Hecho.

echo.
echo Todos los servicios detenidos.
pause
