package com.escuela.gestion.config;

import com.escuela.gestion.models.Rol;
import com.escuela.gestion.models.Rol.NombreRol;
import com.escuela.gestion.models.Usuario;
import com.escuela.gestion.repositories.RolRepository;
import com.escuela.gestion.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.logging.Logger;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = Logger.getLogger(DataInitializer.class.getName());

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RolRepository rolRepository, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Crear roles si no existen
        for (NombreRol nombre : NombreRol.values()) {
            if (rolRepository.findByNombre(nombre).isEmpty()) {
                Rol rol = new Rol();
                rol.setNombre(nombre);
                rolRepository.save(rol);
                log.info("Rol creado: " + nombre);
            }
        }

        // Crear usuario dueño por defecto si no hay usuarios
        if (usuarioRepository.count() == 0) {
            Rol rolDueno = rolRepository.findByNombre(NombreRol.ROLE_DUENO).orElseThrow();
            Usuario dueno = new Usuario();
            dueno.setNombre("Administrador");
            dueno.setEmail("admin@escuela.com");
            dueno.setPassword(passwordEncoder.encode("admin123"));
            dueno.setActivo(true);
            dueno.setRoles(Set.of(rolDueno));
            usuarioRepository.save(dueno);
            log.info("Usuario admin creado: admin@escuela.com / admin123");
        }
    }
}
