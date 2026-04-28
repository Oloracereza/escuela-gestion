# Sistema de Gestión Escolar

Aplicación web para gestionar asistencia y pagos de alumnos.

## Stack
- **Frontend:** React 18 + PrimeReact + Vite
- **Backend:** Spring Boot 3 + Java 17 + Spring Security (JWT)
- **Base de datos:** MySQL 8

## Estructura
\\\
escuela-gestion/
├── frontend/     → React + PrimeReact
├── backend/      → Spring Boot REST API
└── database/     → Scripts SQL
\\\

## Roles
| Rol | Permisos |
|-----|----------|
| Dueño | Acceso total |
| Secretaria | Pagos y registro de alumnos |
| Entrenador | Pase de lista / asistencia |

## Instalación
Ver documentación en cada subcarpeta.

## Backend y MySQL
El backend usa estas variables de entorno si tu MySQL no permite `root` sin contraseña:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`

Ejemplo en PowerShell:

```powershell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="tu_password"
mvn spring-boot:run
```
