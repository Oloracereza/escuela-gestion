package com.escuela.gestion.controllers;

import com.escuela.gestion.dto.AlumnoDTO;
import com.escuela.gestion.models.Alumno;
import com.escuela.gestion.repositories.AlumnoRepository;
import com.escuela.gestion.repositories.GrupoRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {

    private final AlumnoRepository alumnoRepository;
    private final GrupoRepository  grupoRepository;

    public AlumnoController(AlumnoRepository alumnoRepository, GrupoRepository grupoRepository) {
        this.alumnoRepository = alumnoRepository;
        this.grupoRepository = grupoRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AlumnoDTO> listar() {
        // findAllWithGrupo usa JOIN FETCH — una sola consulta para todos
        return alumnoRepository.findAllWithGrupo().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/activos")
    @Transactional(readOnly = true)
    public List<AlumnoDTO> listarActivos() {
        return alumnoRepository.findByActivoTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<AlumnoDTO> obtener(@PathVariable Long id) {
        return alumnoRepository.findById(id)
                .map(a -> ResponseEntity.ok(toDTO(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<AlumnoDTO> crear(@Valid @RequestBody AlumnoDTO dto) {
        Alumno alumno = toEntity(dto, new Alumno());
        return ResponseEntity.ok(toDTO(alumnoRepository.save(alumno)));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<AlumnoDTO> actualizar(@PathVariable Long id,
                                                @Valid @RequestBody AlumnoDTO dto) {
        return alumnoRepository.findById(id).map(alumno -> {
            toEntity(dto, alumno);
            return ResponseEntity.ok(toDTO(alumnoRepository.save(alumno)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        return alumnoRepository.findById(id).map(alumno -> {
            alumno.setActivo(false);
            alumnoRepository.save(alumno);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── helpers ──────────────────────────────────────────────

    private AlumnoDTO toDTO(Alumno a) {
        AlumnoDTO dto = new AlumnoDTO();
        dto.setId(a.getId());
        dto.setNombre(a.getNombre());
        dto.setApellido(a.getApellido());
        dto.setEmail(a.getEmail());
        dto.setTelefono(a.getTelefono());
        dto.setFechaInscripcion(a.getFechaInscripcion());
        dto.setActivo(a.isActivo());
        if (a.getGrupo() != null) {
            dto.setGrupoId(a.getGrupo().getId());
            dto.setGrupoNombre(a.getGrupo().getNombre());
        }
        return dto;
    }

    private Alumno toEntity(AlumnoDTO dto, Alumno alumno) {
        alumno.setNombre(dto.getNombre());
        alumno.setApellido(dto.getApellido());
        alumno.setEmail(dto.getEmail());
        alumno.setTelefono(dto.getTelefono());
        alumno.setFechaInscripcion(dto.getFechaInscripcion());
        alumno.setActivo(dto.isActivo());
        if (dto.getGrupoId() != null) {
            grupoRepository.findById(dto.getGrupoId()).ifPresent(alumno::setGrupo);
        }
        return alumno;
    }
}
