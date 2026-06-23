package com.elshaddai.controller;

import com.elshaddai.entity.Lead;
import com.elshaddai.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadRepository leadRepo;

    @GetMapping
    public List<Lead> list() {
        return leadRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Lead lead) {
        if (lead.getStatus() == null) lead.setStatus(Lead.Status.NEW);
        Lead saved = leadRepo.save(lead);
        return Map.of("id", saved.getId(), "message", "Lead created");
    }

    @PatchMapping("/{id}")
    public Map<String, Boolean> patch(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        requireAdmin(auth);
        Lead lead = leadRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lead not found"));
        if (body.containsKey("status")) {
            try { lead.setStatus(Lead.Status.valueOf(body.get("status"))); }
            catch (IllegalArgumentException ignored) {}
        }
        leadRepo.save(lead);
        return Map.of("ok", true);
    }

    private void requireAdmin(Authentication auth) {
        boolean ok = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (!ok) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
    }
}
