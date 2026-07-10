package com.escuela.gestion.repositories;

import com.escuela.gestion.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // JOIN FETCH garantiza que los roles se carguen en la misma consulta SQL
    // Sin esto los roles llegan vacíos porque la sesión JPA ya se cerró
    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}
