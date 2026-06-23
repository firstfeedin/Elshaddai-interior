package com.elshaddai.controller;

import com.elshaddai.entity.Vendor;
import com.elshaddai.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorRepository vendorRepo;

    @GetMapping
    public List<Vendor> list() {
        return vendorRepo.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Vendor create(@RequestBody Map<String, String> body) {
        return vendorRepo.save(Vendor.builder()
                .name(body.get("name"))
                .contactPerson(body.get("contactPerson"))
                .email(body.get("email"))
                .phone(body.get("phone"))
                .address(body.get("address"))
                .category(body.get("category"))
                .notes(body.get("notes"))
                .build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Vendor update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Vendor v = vendorRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found"));
        if (body.containsKey("name"))          v.setName(body.get("name"));
        if (body.containsKey("contactPerson")) v.setContactPerson(body.get("contactPerson"));
        if (body.containsKey("email"))         v.setEmail(body.get("email"));
        if (body.containsKey("phone"))         v.setPhone(body.get("phone"));
        if (body.containsKey("status"))        v.setStatus(Vendor.Status.valueOf(body.get("status")));
        if (body.containsKey("notes"))         v.setNotes(body.get("notes"));
        return vendorRepo.save(v);
    }
}
