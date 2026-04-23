@echo off
title Backend - Spring Boot

set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "MVN=C:\Users\Lauro Valdez\Documents\Maven\apache-maven-3.9.9\bin\mvn.cmd"

cd /d "C:\Users\Lauro Valdez\Documents\escuela-gestion\backend"
echo JAVA_HOME=%JAVA_HOME%
echo Arrancando Spring Boot...
"%MVN%" spring-boot:run
pause
