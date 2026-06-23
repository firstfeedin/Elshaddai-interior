package com.elshaddai.controller;

import com.elshaddai.dto.AuthRequest;
import com.elshaddai.dto.AuthResponse;
import com.elshaddai.entity.User;
import com.elshaddai.repository.UserRepository;
import com.elshaddai.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;

    private AuthResponse toResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwt.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.getName()))
                .user(AuthResponse.UserDto.from(user))
                .build();
    }

    // ── Register ──────────────────────────────────────────────────
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody AuthRequest.Register req) {
        if (userRepo.existsByEmailIgnoreCase(req.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        if (req.getPassword().length() < 8)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");

        User.Role role;
        try { role = User.Role.valueOf(req.getRole() != null ? req.getRole() : "CLIENT"); }
        catch (IllegalArgumentException e) { role = User.Role.CLIENT; }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase())
                .passwordHash(encoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(role)
                .city(req.getCity())
                .organisationName(req.getOrganisationName())
                .yearsExperience(req.getYearsExperience())
                .specialisation(req.getSpecialisation())
                .isActive(true)
                .build();

        return toResponse(userRepo.save(user));
    }

    // ── Login ─────────────────────────────────────────────────────
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest.Login req) {
        User user = userRepo.findByEmailIgnoreCase(req.getEmail())
                .filter(User::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!encoder.matches(req.getPassword(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");

        return toResponse(user);
    }

    // ── Me ────────────────────────────────────────────────────────
    @GetMapping("/me")
    public AuthResponse.UserDto me(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return AuthResponse.UserDto.from(
                userRepo.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
        );
    }

    // ── Google OAuth ──────────────────────────────────────────────
    @PostMapping("/google")
    public AuthResponse google(@RequestBody AuthRequest.GoogleAuth req) {
        try {
            String[] parts   = req.getCredential().split("\\.");
            String   payload = new String(Base64.getUrlDecoder().decode(parts[1]));
            // naive JSON parse for email/name/email_verified
            String email  = extractJsonStr(payload, "email");
            String name   = extractJsonStr(payload, "name");
            boolean verified = payload.contains("\"email_verified\":true");
            if (!verified) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google email not verified");

            User.Role role;
            try { role = User.Role.valueOf(req.getRole() != null ? req.getRole() : "CLIENT"); }
            catch (IllegalArgumentException e) { role = User.Role.CLIENT; }

            final User.Role finalRole = role;
            User user = userRepo.findByEmailIgnoreCase(email).orElseGet(() ->
                    userRepo.save(User.builder()
                            .name(name).email(email.toLowerCase())
                            .passwordHash("").role(finalRole).isActive(true)
                            .build())
            );
            return toResponse(user);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Google credential");
        }
    }

    // ── Update Profile ────────────────────────────────────────────
    @PutMapping("/profile")
    public AuthResponse.UserDto updateProfile(@RequestBody AuthRequest.UpdateProfile req, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepo.findById(userId).orElseThrow();
        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getCity() != null) user.setCity(req.getCity());
        if (req.getOrganisationName() != null) user.setOrganisationName(req.getOrganisationName());
        if (req.getYearsExperience() != null) user.setYearsExperience(req.getYearsExperience());
        if (req.getSpecialisation() != null) user.setSpecialisation(req.getSpecialisation());
        return AuthResponse.UserDto.from(userRepo.save(user));
    }

    // ── Change Password ───────────────────────────────────────────
    @PutMapping("/change-password")
    public Map<String, String> changePassword(@RequestBody AuthRequest.ChangePassword req, Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        User user = userRepo.findById(userId).orElseThrow();
        if (!encoder.matches(req.getCurrentPassword(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        if (req.getNewPassword().length() < 8)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
        user.setPasswordHash(encoder.encode(req.getNewPassword()));
        userRepo.save(user);
        return Map.of("message", "Password changed successfully");
    }

    // ── Admin: list users ─────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(Authentication auth) {
        requireAdmin(auth);
        return ResponseEntity.ok(userRepo.findAll().stream().map(AuthResponse.UserDto::from).toList());
    }

    @PutMapping("/users/{id}/toggle")
    public Map<String, String> toggleUser(@PathVariable Long id, Authentication auth) {
        requireAdmin(auth);
        User user = userRepo.findById(id).orElseThrow();
        user.setActive(!user.isActive());
        userRepo.save(user);
        return Map.of("message", "Updated");
    }

    private void requireAdmin(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (!isAdmin) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
    }

    private String extractJsonStr(String json, String key) {
        String search = "\"" + key + "\":\"";
        int i = json.indexOf(search);
        if (i < 0) return "";
        int start = i + search.length();
        int end = json.indexOf("\"", start);
        return end < 0 ? "" : json.substring(start, end);
    }
}
