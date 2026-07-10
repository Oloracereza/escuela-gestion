package com.escuela.gestion.controllers;

import com.escuela.gestion.dto.LoginRequest;
import com.escuela.gestion.dto.LoginResponse;
import com.escuela.gestion.repositories.UsuarioRepository;
import com.escuela.gestion.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService    userDetailsService;
    private final JwtUtil               jwtUtil;
    private final UsuarioRepository     usuarioRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          UserDetailsService userDetailsService,
                          JwtUtil jwtUtil,
                          UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService    = userDetailsService;
        this.jwtUtil               = jwtUtil;
        this.usuarioRepository     = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {

        // 1. Validar credenciales
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. Cargar usuario UNA sola vez con @Transactional activo en UserDetailsServiceImpl
        //    Aquí ya vienen los roles porque la sesión JPA está abierta
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

        // 3. Generar token
        String token = jwtUtil.generateToken(userDetails);

        // 4. Obtener nombre real — reutilizamos lo que ya cargó UserDetailsService
        //    para no hacer una segunda query a la BD
        String nombreReal = usuarioRepository.findByEmail(request.getEmail())
                .map(u -> u.getNombre())
                .orElse(request.getEmail());

        // 5. Extraer roles directamente del UserDetails (ya cargados correctamente)
        var roles = userDetails.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new LoginResponse(token, request.getEmail(), nombreReal, roles));
    }
}
