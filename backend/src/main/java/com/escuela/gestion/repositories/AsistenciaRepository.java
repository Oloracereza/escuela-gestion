package com.escuela.gestion.repositories;

import com.escuela.gestion.models.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    @Query("SELECT a FROM Asistencia a JOIN FETCH a.alumno WHERE a.alumno.id = :alumnoId")
    List<Asistencia> findByAlumnoId(Long alumnoId);

    @Query("SELECT a FROM Asistencia a JOIN FETCH a.alumno WHERE a.fecha = :fecha")
    List<Asistencia> findByFecha(LocalDate fecha);

    @Query("SELECT a FROM Asistencia a JOIN FETCH a.alumno WHERE a.alumno.grupo.id = :grupoId AND a.fecha = :fecha")
    List<Asistencia> findByAlumnoGrupoIdAndFecha(Long grupoId, LocalDate fecha);

    boolean existsByAlumnoIdAndFecha(Long alumnoId, LocalDate fecha);
}
