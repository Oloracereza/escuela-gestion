-- ============================================================
--  Sistema de Gestión Escolar Deportiva
--  Archivo: 02_seed.sql
--  Descripción: Datos iniciales para pruebas / demo
-- ============================================================

USE escuela_gestion;

-- Roles del sistema
INSERT IGNORE INTO roles (nombre) VALUES
  ('ROLE_DUENO'),
  ('ROLE_SECRETARIA'),
  ('ROLE_ENTRENADOR');

-- Usuario administrador (contraseña: admin123)
INSERT IGNORE INTO usuarios (nombre, email, password) VALUES
  ('Administrador', 'admin@escuela.com',
   '$2a$10$7QJ8Qz1u6v5k3M9X2WnOzO8YkLpRmN4sDfGhJtPwVbCxAeKiUsY6');

-- Asignar rol dueño al admin
INSERT IGNORE INTO usuario_roles (usuario_id, rol_id)
  SELECT u.id, r.id FROM usuarios u, roles r
  WHERE u.email = 'admin@escuela.com' AND r.nombre = 'ROLE_DUENO';

-- Grupos de ejemplo
INSERT IGNORE INTO grupos (nombre, descripcion) VALUES
  ('Pre-Benjamín', 'Alumnos de 5 a 7 años'),
  ('Benjamín',     'Alumnos de 8 a 9 años'),
  ('Infantil',     'Alumnos de 10 a 11 años'),
  ('Cadete',       'Alumnos de 12 a 14 años');

-- Alumnos de ejemplo
INSERT IGNORE INTO alumnos (nombre, apellido, email, telefono, fecha_inscripcion, grupo_id) VALUES
  ('María',   'Rodríguez', 'maria.r@mail.com',  '7821234567', '2026-01-10', 1),
  ('Juan',    'López',     'juan.l@mail.com',   '7829876543', '2026-01-12', 1),
  ('Ana',     'Sánchez',   'ana.s@mail.com',    '7821112222', '2026-02-01', 2),
  ('Carlos',  'Mendoza',   'carlos.m@mail.com', '7823334444', '2026-02-05', 2),
  ('Lucía',   'Pérez',     'lucia.p@mail.com',  '7825556666', '2026-01-20', 3),
  ('Diego',   'García',    'diego.g@mail.com',  '7827778888', '2026-03-01', 3);

-- Pagos de ejemplo
INSERT IGNORE INTO pagos (alumno_id, monto, fecha_pago, mes_correspondiente, metodo_pago, concepto) VALUES
  (1, 400.00, '2026-04-05', 'Abril 2026',  'EFECTIVO',     'Mensualidad abril'),
  (2, 400.00, '2026-03-10', 'Marzo 2026',  'TRANSFERENCIA','Mensualidad marzo'),
  (3, 400.00, '2026-04-01', 'Abril 2026',  'EFECTIVO',     'Mensualidad abril'),
  (5, 400.00, '2026-04-08', 'Abril 2026',  'TARJETA',      'Mensualidad abril');

-- Asistencias de ejemplo (hoy)
INSERT IGNORE INTO asistencias (alumno_id, fecha, estado) VALUES
  (1, CURDATE(), 'PRESENTE'),
  (2, CURDATE(), 'AUSENTE'),
  (3, CURDATE(), 'PRESENTE'),
  (4, CURDATE(), 'TARDANZA'),
  (5, CURDATE(), 'PRESENTE'),
  (6, CURDATE(), 'AUSENTE');
