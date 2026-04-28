package com.escuela.gestion.controllers;

import com.escuela.gestion.dto.AsistenciaDTO;
import com.escuela.gestion.models.Asistencia;
import com.escuela.gestion.repositories.AlumnoRepository;
import com.escuela.gestion.repositories.AsistenciaRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/asistencia")
public class AsistenciaController {

    private final AsistenciaRepository asistenciaRepository;
    private final AlumnoRepository alumnoRepository;

    public AsistenciaController(AsistenciaRepository asistenciaRepository, AlumnoRepository alumnoRepository) {
        this.asistenciaRepository = asistenciaRepository;
        this.alumnoRepository = alumnoRepository;
    }

    @GetMapping("/alumno/{alumnoId}")
    public List<AsistenciaDTO> porAlumno(@PathVariable Long alumnoId) {
        return asistenciaRepository.findByAlumnoId(alumnoId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/fecha/{fecha}")
    public List<AsistenciaDTO> porFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return asistenciaRepository.findByFecha(fecha)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/grupo/{grupoId}/fecha/{fecha}")
    public List<AsistenciaDTO> porGrupoYFecha(
            @PathVariable Long grupoId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return asistenciaRepository.findByAlumnoGrupoIdAndFecha(grupoId, fecha)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<AsistenciaDTO> registrar(@Valid @RequestBody AsistenciaDTO dto) {
        Asistencia a = new Asistencia();
        alumnoRepository.findById(dto.getAlumnoId()).ifPresent(a::setAlumno);
        a.setFecha(dto.getFecha());
        a.setEstado(dto.getEstado());
        a.setObservaciones(dto.getObservaciones());
        return ResponseEntity.ok(toDTO(asistenciaRepository.save(a)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AsistenciaDTO> actualizar(@PathVariable Long id, @Valid @RequestBody AsistenciaDTO dto) {
        return asistenciaRepository.findById(id).map(a -> {
            a.setEstado(dto.getEstado());
            a.setObservaciones(dto.getObservaciones());
            return ResponseEntity.ok(toDTO(asistenciaRepository.save(a)));
        }).orElse(ResponseEntity.notFound().build());
    }

    private AsistenciaDTO toDTO(Asistencia a) {
        AsistenciaDTO dto = new AsistenciaDTO();
        dto.setId(a.getId());
        dto.setFecha(a.getFecha());
        dto.setEstado(a.getEstado());
        dto.setObservaciones(a.getObservaciones());
        if (a.getAlumno() != null) {
            dto.setAlumnoId(a.getAlumno().getId());
            dto.setAlumnoNombre(a.getAlumno().getNombre() + " " + a.getAlumno().getApellido());
        }
        return dto;
    }
}
