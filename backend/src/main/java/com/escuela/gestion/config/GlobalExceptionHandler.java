package com.escuela.gestion.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

// Sin esto, un error de base de datos (ej. un email duplicado) queda sin
// capturar, sube hasta el filtro de seguridad de Spring y sale como un 403
// genérico - un mensaje que no tiene nada que ver con la causa real. Esta
// clase intercepta esos errores ANTES de que lleguen ahí y responde con un
// mensaje claro.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        // DataIntegrityViolationException cubre CUALQUIER regla de la base de
        // datos rota (no solo correos duplicados: también un campo obligatorio
        // faltante, una referencia a un registro que no existe, etc.), así que
        // el mensaje no debe asumir que siempre se trata de un duplicado.
        String mensaje = "No se pudo guardar: los datos no cumplen una regla de la base de datos "
                + "(por ejemplo, un valor que debe ser único ya está en uso, o falta un dato obligatorio).";
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", mensaje));
    }
}
