package com.escuela.gestion.repositories;

import com.escuela.gestion.models.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GrupoRepository extends JpaRepository<Grupo, Long> {
    List<Grupo> findByEntrenadorId(Long entrenadorId);
}
