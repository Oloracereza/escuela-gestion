package com.escuela.gestion.controllers;

import com.escuela.gestion.dto.AlumnoDTO;
import com.escuela.gestion.models.Alumno;
import com.escuela.gestion.repositories.AlumnoRepository;
import com.escuela.gestion.repositories.GrupoRepository;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AlumnoControllerTest {

    private final AlumnoRepository alumnoRepository = mock(AlumnoRepository.class);
    private final GrupoRepository grupoRepository = mock(GrupoRepository.class);
    private final AlumnoController controller = new AlumnoController(alumnoRepository, grupoRepository);

    @Test
    void crearMantieneAlumnoActivoCuandoElDtoNoLoEspecifica() {
        when(alumnoRepository.save(any(Alumno.class))).thenAnswer(invocation -> {
            Alumno alumno = invocation.getArgument(0);
            alumno.setId(1L);
            return alumno;
        });

        AlumnoDTO dto = new AlumnoDTO();
        dto.setNombre("Diego");
        dto.setApellido("Garcia");

        var response = controller.crear(dto);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isActivo()).isTrue();
        verify(alumnoRepository).save(argThat(Alumno::isActivo));
    }
}
