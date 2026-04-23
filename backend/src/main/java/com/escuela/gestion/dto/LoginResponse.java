package com.escuela.gestion.dto;

import java.util.List;

public class LoginResponse {
    private String token;
    private String email;
    private String nombre;
    private List<String> roles;

    public LoginResponse(String token, String email, String nombre, List<String> roles) {
        this.token = token;
        this.email = email;
        this.nombre = nombre;
        this.roles = roles;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
