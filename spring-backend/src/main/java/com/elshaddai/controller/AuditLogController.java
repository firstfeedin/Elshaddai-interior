package com.elshaddai.controller;

import com.elshaddai.entity.AuditLog;
import com.elshaddai.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-log")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository auditRepo;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public List<AuditLog> list() {
        return auditRepo.findTop200ByOrderByCreatedAtDesc();
    }
}
