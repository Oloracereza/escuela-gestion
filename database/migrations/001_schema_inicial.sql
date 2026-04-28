-- ============================================
-- ESCUELA GESTIÓN - Schema inicial
-- ============================================

CREATE DATABASE IF NOT EXISTS escuela_gestion
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE escuela_gestion;

-- Roles del sistema
CREATE TABLE roles (
  id      BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(50) NOT NULL UNIQUE   -- DUENO, SECRETARIA, ENTRENADOR
);

-- Usuarios del sistema
CREATE TABLE usuarios (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(50)  NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  nombre       VARCHAR(100) NOT NULL,
  activo       BOOLEAN      DEFAULT TRUE,
  rol_id       BIGINT       NOT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Alumnos
CREATE TABLE alumnos (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  apellidos    VARCHAR(100) NOT NULL,
  fecha_nac    DATE,
  telefono     VARCHAR(20),
  email        VARCHAR(100),
  activo       BOOLEAN      DEFAULT TRUE,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Asistencias
CREATE TABLE asistencias (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  alumno_id    BIGINT  NOT NULL,
  fecha        DATE    NOT NULL,
  presente     BOOLEAN DEFAULT FALSE,
  registrado_por BIGINT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
  UNIQUE KEY uk_asistencia (alumno_id, fecha)
);

-- Pagos
CREATE TABLE pagos (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  alumno_id    BIGINT         NOT NULL,
  monto        DECIMAL(10,2)  NOT NULL,
  concepto     VARCHAR(200)   NOT NULL,
  fecha_pago   DATE           NOT NULL,
  registrado_por BIGINT       NOT NULL,
  created_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);

-- ============================================
-- Datos iniciales
-- ============================================
INSERT INTO roles (nombre) VALUES ('DUENO'), ('SECRETARIA'), ('ENTRENADOR');

-- Usuario admin por defecto (password: admin123 — cambiar en producción)
INSERT INTO usuarios (username, password, nombre, rol_id) VALUES
  ('admin', '\\\', 'Administrador', 1);
