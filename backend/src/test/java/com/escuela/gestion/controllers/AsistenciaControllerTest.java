package com.escuela.gestion.controllers;

import com.escuela.gestion.dto.AsistenciaDTO;
import com.escuela.gestion.models.Alumno;
import com.escuela.gestion.models.Asistencia;
import com.escuela.gestion.models.Asistencia.EstadoAsistencia;
import com.escuela.gestion.repositories.AlumnoRepository;
import com.escuela.gestion.repositories.AsistenciaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AsistenciaControllerTest {

    private final AsistenciaRepository asistenciaRepository = mock(AsistenciaRepository.class);
    private final AlumnoRepository alumnoRepository = mock(AlumnoRepository.class);
    private final AsistenciaController controller = new AsistenciaController(asistenciaRepository, alumnoRepository);

    @Test
    void registrarActualizaAsistenciaExistenteParaAlumnoYFecha() {
        LocalDate fecha = LocalDate.of(2026, 4, 30);
        Alumno alumno = alumno(7L);
        Asistencia existente = asistencia(15L, alumno, fecha, EstadoAsistencia.AUSENTE);
        Asistencia guardada = asistencia(15L, alumno, fecha, EstadoAsistencia.PRESENTE);

        when(alumnoRepository.findById(7L)).thenReturn(Optional.of(alumno));
        when(asistenciaRepository.findByAlumnoIdAndFecha(7L, fecha)).thenReturn(Optional.of(existente));
        when(asistenciaRepository.save(existente)).thenReturn(guardada);

        AsistenciaDTO dto = dto(7L, fecha, EstadoAsistencia.PRESENTE);

        var response = controller.registrar(dto);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo(15L);
        assertThat(response.getBody().getEstado()).isEqualTo(EstadoAsistencia.PRESENTE);
        verify(asistenciaRepository).save(existente);
    }

    @Test
    void registrarRechazaAlumnoInexistente() {
        LocalDate fecha = LocalDate.of(2026, 4, 30);
        when(alumnoRepository.findById(99L)).thenReturn(Optional.empty());

        var response = controller.registrar(dto(99L, fecha, EstadoAsistencia.PRESENTE));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        verify(asistenciaRepository, never()).save(any());
    }

    @Test
    void porFechaDevuelveAlumnosActivosSinRegistroComoAusentes() {
        LocalDate fecha = LocalDate.of(2026, 4, 30);
        Alumno conRegistro = alumno(1L);
        conRegistro.setNombre("Ana");
        Alumno sinRegistro = alumno(2L);
        sinRegistro.setNombre("Luis");

        when(alumnoRepository.findByActivoTrue()).thenReturn(List.of(conRegistro, sinRegistro));
        when(asistenciaRepository.findByFecha(fecha)).thenReturn(List.of(
                asistencia(10L, conRegistro, fecha, EstadoAsistencia.PRESENTE)
        ));

        List<AsistenciaDTO> resultado = controller.porFecha(fecha);

        assertThat(resultado).hasSize(2);
        assertThat(resultado)
                .extracting(AsistenciaDTO::getAlumnoId, AsistenciaDTO::getEstado)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(1L, EstadoAsistencia.PRESENTE),
                        org.assertj.core.groups.Tuple.tuple(2L, EstadoAsistencia.AUSENTE)
                );
        assertThat(resultado.get(1).getId()).isNull();
    }

    private static AsistenciaDTO dto(Long alumnoId, LocalDate fecha, EstadoAsistencia estado) {
        AsistenciaDTO dto = new AsistenciaDTO();
        dto.setAlumnoId(alumnoId);
        dto.setFecha(fecha);
        dto.setEstado(estado);
        return dto;
    }

    private static Alumno alumno(Long id) {
        Alumno alumno = new Alumno();
        alumno.setId(id);
        alumno.setNombre("Ana");
        alumno.setApellido("Lopez");
        alumno.setActivo(true);
        return alumno;
    }

    private static Asistencia asistencia(Long id, Alumno alumno, LocalDate fecha, EstadoAsistencia estado) {
        Asistencia asistencia = new Asistencia();
        asistencia.setId(id);
        asistencia.setAlumno(alumno);
        asistencia.setFecha(fecha);
        asistencia.setEstado(estado);
        return asistencia;
    }
}
