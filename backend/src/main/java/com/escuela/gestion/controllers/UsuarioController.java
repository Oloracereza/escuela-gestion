package com.escuela.gestion.controllers;

import com.escuela.gestion.dto.UsuarioDTO;
import com.escuela.gestion.models.Rol;
import com.escuela.gestion.models.Usuario;
import com.escuela.gestion.repositories.RolRepository;
import com.escuela.gestion.repositories.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository     rolRepository;
    private final PasswordEncoder   passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<UsuarioDTO> listar() {
        return usuarioRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody UsuarioDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body("El correo ya está registrado");
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("La contraseña es obligatoria");
        }

        Set<Rol> roles = resolverRoles(dto.getRoles());

        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setActivo(true);
        usuario.setRoles(roles);

        return ResponseEntity.ok(toDTO(usuarioRepository.save(usuario)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioDTO dto) {
        return usuarioRepository.findById(id).map(u -> {
            u.setNombre(dto.getNombre());
            u.setActivo(dto.isActivo());
            u.setRoles(resolverRoles(dto.getRoles()));

            // Solo actualizar contraseña si viene en el DTO
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                u.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            return ResponseEntity.ok(toDTO(usuarioRepository.save(u)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(u -> {
            u.setActivo(false);
            usuarioRepository.save(u);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // ---------- helpers ----------

    private Set<Rol> resolverRoles(Set<String> nombres) {
        if (nombres == null || nombres.isEmpty()) return Set.of();
        return nombres.stream()
                .map(n -> rolRepository.findByNombre(Rol.NombreRol.valueOf(n))
                        .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado: " + n)))
                .collect(Collectors.toSet());
    }

    private UsuarioDTO toDTO(@NonNull Usuario u) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(u.getId());
        dto.setNombre(u.getNombre());
        dto.setEmail(u.getEmail());
        dto.setActivo(u.isActivo());
        dto.setRoles(u.getRoles().stream()
                .map(r -> r.getNombre().name())
                .collect(Collectors.toSet()));
        return dto;
    }
}
