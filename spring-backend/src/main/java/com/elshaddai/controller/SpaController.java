package com.elshaddai.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

/**
 * Serves index.html for all non-API, non-static routes so React Router works
 * when the production build is embedded inside the Spring Boot JAR.
 */
@RestController
public class SpaController {

    @GetMapping(value = {
        "/", "/home", "/about", "/contact", "/services", "/portfolio",
        "/blog", "/blog/**", "/pricing", "/privacy", "/terms",
        "/studio", "/login", "/register",
        "/app", "/app/**"
    })
    public ResponseEntity<Resource> spa(HttpServletRequest req) throws IOException {
        Resource index = new ClassPathResource("static/index.html");
        if (!index.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(index);
    }
}
