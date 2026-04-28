package com.escuela.gestion.repositories;

import com.escuela.gestion.models.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlumnoRepository extends JpaRepository<Alumno, Long> {

    // JOIN FETCH carga el grupo en la misma consulta — evita N+1 queries
    @Query("SELECT a FROM Alumno a LEFT JOIN FETCH a.grupo WHERE a.activo = true")
    List<Alumno> findByActivoTrue();

    @Query("SELECT a FROM Alumno a LEFT JOIN FETCH a.grupo")
    List<Alumno> findAllWithGrupo();

    List<Alumno> findByGrupoId(Long grupoId);

    boolean existsByEmail(String email);
}
