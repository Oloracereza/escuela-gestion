package com.escuela.gestion.repositories;

import com.escuela.gestion.models.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    @Query("SELECT p FROM Pago p JOIN FETCH p.alumno")
    List<Pago> findAllWithAlumno();

    @Query("SELECT p FROM Pago p JOIN FETCH p.alumno WHERE p.alumno.id = :alumnoId")
    List<Pago> findByAlumnoId(Long alumnoId);

    @Query("SELECT p FROM Pago p JOIN FETCH p.alumno WHERE p.fechaPago BETWEEN :inicio AND :fin")
    List<Pago> findByFechaPagoBetween(LocalDate inicio, LocalDate fin);

    @Query("SELECT p FROM Pago p JOIN FETCH p.alumno WHERE p.mesCorrespondiente = :mes")
    List<Pago> findByMesCorrespondiente(String mes);
}
