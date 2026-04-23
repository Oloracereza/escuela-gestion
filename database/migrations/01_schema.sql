-- ============================================================
--  Sistema de Gestión Escolar Deportiva
--  Archivo: 01_schema.sql
--  Descripción: Creación de tablas y relaciones
-- ============================================================

CREATE DATABASE IF NOT EXISTS escuela_gestion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE escuela_gestion;

-- ------------------------------------------------------------
-- ROLES: catálogo de perfiles del sistema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id     BIGINT       NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30)  NOT NULL UNIQUE,   -- ROLE_DUENO | ROLE_SECRETARIA | ROLE_ENTRENADOR
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- USUARIOS: personas que acceden al sistema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  nombre     VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,       -- BCrypt hash
  activo     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- ------------------------------------------------------------
-- USUARIO_ROLES: relación muchos-a-muchos usuario ↔ rol
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario_roles (
  usuario_id BIGINT NOT NULL,
  rol_id     BIGINT NOT NULL,
  PRIMARY KEY (usuario_id, rol_id),
  CONSTRAINT fk_ur_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_rol     FOREIGN KEY (rol_id)     REFERENCES roles    (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- GRUPOS: categorías deportivas (Pre-benjamín, Benjamín, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grupos (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(80)  NOT NULL UNIQUE,
  descripcion   VARCHAR(255),
  entrenador_id BIGINT,                  -- FK → usuarios (entrenador asignado)
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_grupo_entrenador FOREIGN KEY (entrenador_id) REFERENCES usuarios (id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- ALUMNOS: estudiantes registrados en la escuela
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumnos (
  id                BIGINT       NOT NULL AUTO_INCREMENT,
  nombre            VARCHAR(80)  NOT NULL,
  apellido          VARCHAR(80)  NOT NULL,
  email             VARCHAR(100) UNIQUE,
  telefono          VARCHAR(20),
  fecha_inscripcion DATE,
  activo            TINYINT(1)   NOT NULL DEFAULT 1,
  grupo_id          BIGINT,              -- FK → grupos
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_alumno_grupo FOREIGN KEY (grupo_id) REFERENCES grupos (id) ON DELETE SET NULL
);

-- ------------------------------------------------------------
-- ASISTENCIAS: registro diario de presencia por alumno
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asistencias (
  id            BIGINT      NOT NULL AUTO_INCREMENT,
  alumno_id     BIGINT      NOT NULL,
  fecha         DATE        NOT NULL,
  estado        ENUM('PRESENTE','AUSENTE','JUSTIFICADO','TARDANZA') NOT NULL DEFAULT 'AUSENTE',
  observaciones VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE KEY uq_asistencia_dia (alumno_id, fecha),   -- un registro por alumno por día
  CONSTRAINT fk_asist_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos (id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- PAGOS: registro de mensualidades
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
  id                  BIGINT         NOT NULL AUTO_INCREMENT,
  alumno_id           BIGINT         NOT NULL,
  monto               DECIMAL(10,2)  NOT NULL,
  fecha_pago          DATE           NOT NULL,
  mes_correspondiente VARCHAR(20),           -- ej. "Abril 2026"
  metodo_pago         ENUM('EFECTIVO','TRANSFERENCIA','TARJETA'),
  concepto            VARCHAR(255),
  registrado_por      BIGINT,               -- FK → usuarios (secretaria/admin que cobró)
  created_at          TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_pago_alumno  FOREIGN KEY (alumno_id)        REFERENCES alumnos  (id) ON DELETE CASCADE,
  CONSTRAINT fk_pago_usuario FOREIGN KEY (registrado_por)   REFERENCES usuarios (id) ON DELETE SET NULL
);
