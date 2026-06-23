package com.elshaddai.controller;

import com.elshaddai.entity.Material;
import com.elshaddai.entity.Project;
import com.elshaddai.entity.Vendor;
import com.elshaddai.repository.MaterialRepository;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialRepository materialRepo;
    private final ProjectRepository  projectRepo;
    private final VendorRepository   vendorRepo;

    @GetMapping
    public List<Material> list(@RequestParam(required = false) Long project_id) {
        if (project_id != null) return materialRepo.findByProjectId(project_id);
        return materialRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Material create(@RequestBody Map<String, Object> body) {
        Project project = null;
        Vendor  vendor  = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);
        if (body.get("vendorId") != null)
            vendor = vendorRepo.findById(Long.valueOf(body.get("vendorId").toString())).orElse(null);

        return materialRepo.save(Material.builder()
                .name(body.get("name") != null ? body.get("name").toString() : null)
                .category(body.get("category") != null ? body.get("category").toString() : null)
                .unit(body.get("unit") != null ? body.get("unit").toString() : null)
                .quantity(body.get("quantity") != null ? new BigDecimal(body.get("quantity").toString()) : null)
                .unitCost(body.get("unitCost") != null ? new BigDecimal(body.get("unitCost").toString()) : null)
                .project(project)
                .vendor(vendor)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }

    @PutMapping("/{id}/status")
    public Material updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Material m = materialRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));
        m.setStatus(Material.Status.valueOf(body.get("status")));
        return materialRepo.save(m);
    }
}
