package com.escuela.gestion.dto;

import com.escuela.gestion.models.Asistencia.EstadoAsistencia;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AsistenciaDTO {
    private Long id;
    @NotNull private Long alumnoId;
    private String alumnoNombre;
    @NotNull private LocalDate fecha;
    @NotNull private EstadoAsistencia estado;
    private String observaciones;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAlumnoId() { return alumnoId; }
    public void setAlumnoId(Long alumnoId) { this.alumnoId = alumnoId; }

    public String getAlumnoNombre() { return alumnoNombre; }
    public void setAlumnoNombre(String alumnoNombre) { this.alumnoNombre = alumnoNombre; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public EstadoAsistencia getEstado() { return estado; }
    public void setEstado(EstadoAsistencia estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}
