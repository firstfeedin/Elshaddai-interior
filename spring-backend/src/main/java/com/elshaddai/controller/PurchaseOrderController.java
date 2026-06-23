package com.elshaddai.controller;

import com.elshaddai.entity.PurchaseOrder;
import com.elshaddai.entity.Project;
import com.elshaddai.entity.Vendor;
import com.elshaddai.repository.PurchaseOrderRepository;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderRepository poRepo;
    private final ProjectRepository       projectRepo;
    private final VendorRepository        vendorRepo;

    @GetMapping
    public List<PurchaseOrder> list() {
        return poRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public PurchaseOrder create(@RequestBody Map<String, Object> body) {
        Project project = null;
        Vendor  vendor  = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);
        if (body.get("vendorId") != null)
            vendor = vendorRepo.findById(Long.valueOf(body.get("vendorId").toString())).orElse(null);

        return poRepo.save(PurchaseOrder.builder()
                .orderNumber(body.get("orderNumber") != null ? body.get("orderNumber").toString() : null)
                .project(project)
                .vendor(vendor)
                .amount(body.get("amount") != null ? new BigDecimal(body.get("amount").toString()) : null)
                .deliveryDate(body.get("deliveryDate") != null ? LocalDate.parse(body.get("deliveryDate").toString()) : null)
                .items(body.get("items") != null ? body.get("items").toString() : null)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public PurchaseOrder updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        PurchaseOrder po = poRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase order not found"));
        po.setStatus(PurchaseOrder.Status.valueOf(body.get("status")));
        return poRepo.save(po);
    }
}
