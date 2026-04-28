package com.escuela.gestion.controllers;

import com.escuela.gestion.dto.PagoDTO;
import com.escuela.gestion.models.Pago;
import com.escuela.gestion.repositories.AlumnoRepository;
import com.escuela.gestion.repositories.PagoRepository;
import com.escuela.gestion.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoRepository    pagoRepository;
    private final AlumnoRepository  alumnoRepository;
    private final UsuarioRepository usuarioRepository;

    public PagoController(PagoRepository pagoRepository, AlumnoRepository alumnoRepository, UsuarioRepository usuarioRepository) {
        this.pagoRepository = pagoRepository;
        this.alumnoRepository = alumnoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PagoDTO> listar() {
        return pagoRepository.findAllWithAlumno()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/alumno/{alumnoId}")
    @Transactional(readOnly = true)
    public List<PagoDTO> porAlumno(@PathVariable Long alumnoId) {
        return pagoRepository.findByAlumnoId(alumnoId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/mes/{mes}")
    @Transactional(readOnly = true)
    public List<PagoDTO> porMes(@PathVariable String mes) {
        return pagoRepository.findByMesCorrespondiente(mes)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @GetMapping("/rango")
    @Transactional(readOnly = true)
    public List<PagoDTO> porRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return pagoRepository.findByFechaPagoBetween(inicio, fin)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<PagoDTO> registrar(@Valid @RequestBody PagoDTO dto, Authentication auth) {
        Pago pago = new Pago();
        alumnoRepository.findById(dto.getAlumnoId()).ifPresent(pago::setAlumno);
        pago.setMonto(dto.getMonto());
        pago.setFechaPago(dto.getFechaPago());
        pago.setMesCorrespondiente(dto.getMesCorrespondiente());
        pago.setMetodoPago(dto.getMetodoPago());
        pago.setConcepto(dto.getConcepto());
        if (auth != null) {
            usuarioRepository.findByEmail(auth.getName()).ifPresent(pago::setRegistradoPor);
        }
        return ResponseEntity.ok(toDTO(pagoRepository.save(pago)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!pagoRepository.existsById(id)) return ResponseEntity.notFound().build();
        pagoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private PagoDTO toDTO(Pago p) {
        PagoDTO dto = new PagoDTO();
        dto.setId(p.getId());
        dto.setMonto(p.getMonto());
        dto.setFechaPago(p.getFechaPago());
        dto.setMesCorrespondiente(p.getMesCorrespondiente());
        dto.setMetodoPago(p.getMetodoPago());
        dto.setConcepto(p.getConcepto());
        if (p.getAlumno() != null) {
            dto.setAlumnoId(p.getAlumno().getId());
            dto.setAlumnoNombre(p.getAlumno().getNombre() + " " + p.getAlumno().getApellido());
        }
        return dto;
    }
}
