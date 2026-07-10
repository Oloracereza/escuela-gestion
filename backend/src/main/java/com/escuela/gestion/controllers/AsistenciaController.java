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
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
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
        Map<Long, Asistencia> asistenciasPorAlumno = asistenciaRepository.findByFecha(fecha)
                .stream()
                .collect(Collectors.toMap(a -> a.getAlumno().getId(), Function.identity()));

        return alumnoRepository.findByActivoTrue()
                .stream()
                .map(alumno -> toDTO(asistenciasPorAlumno.get(alumno.getId()), alumno, fecha))
                .collect(Collectors.toList());
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
        return alumnoRepository.findById(dto.getAlumnoId()).map(alumno -> {
            Optional<Asistencia> existente = asistenciaRepository.findByAlumnoIdAndFecha(dto.getAlumnoId(), dto.getFecha());
            Asistencia a = existente.orElseGet(Asistencia::new);
            a.setAlumno(alumno);
            a.setFecha(dto.getFecha());
            a.setEstado(dto.getEstado());
            a.setObservaciones(dto.getObservaciones());
            return ResponseEntity.ok(toDTO(asistenciaRepository.save(a)));
        }).orElse(ResponseEntity.notFound().build());
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
        return toDTO(a, a.getAlumno(), a.getFecha());
    }

    private AsistenciaDTO toDTO(Asistencia a, com.escuela.gestion.models.Alumno alumno, LocalDate fecha) {
        AsistenciaDTO dto = new AsistenciaDTO();
        if (a != null) {
            dto.setId(a.getId());
            dto.setEstado(a.getEstado());
            dto.setObservaciones(a.getObservaciones());
        } else {
            dto.setEstado(Asistencia.EstadoAsistencia.AUSENTE);
        }
        dto.setFecha(fecha);
        if (alumno != null) {
            dto.setAlumnoId(alumno.getId());
            dto.setAlumnoNombre(alumno.getNombre() + " " + alumno.getApellido());
        }
        return dto;
    }
}
