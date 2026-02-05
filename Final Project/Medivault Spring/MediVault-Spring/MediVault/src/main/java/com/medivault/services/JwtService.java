package com.medivault.services;

import com.medivault.entites.User;

import io.jsonwebtoken.Claims;

public interface JwtService {

    String generateToken(User user);

    String extractUsername(String token);

    Claims extractAllClaims(String token);

    boolean isTokenValid(String token, String username);
}
