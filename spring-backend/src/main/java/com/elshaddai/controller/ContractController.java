package com.elshaddai.controller;

import com.elshaddai.entity.Contract;
import com.elshaddai.entity.Project;
import com.elshaddai.entity.User;
import com.elshaddai.repository.ContractRepository;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractRepository contractRepo;
    private final ProjectRepository  projectRepo;
    private final UserRepository     userRepo;

    @GetMapping
    public List<Contract> list() {
        return contractRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Contract create(@RequestBody Map<String, Object> body) {
        Project project = null;
        User    client  = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);
        if (body.get("clientId") != null)
            client = userRepo.findById(Long.valueOf(body.get("clientId").toString())).orElse(null);

        return contractRepo.save(Contract.builder()
                .contractNumber(body.get("contractNumber") != null ? body.get("contractNumber").toString() : null)
                .title(body.get("title") != null ? body.get("title").toString() : null)
                .project(project)
                .client(client)
                .value(body.get("value") != null ? new BigDecimal(body.get("value").toString()) : null)
                .startDate(body.get("startDate") != null ? LocalDate.parse(body.get("startDate").toString()) : null)
                .endDate(body.get("endDate") != null ? LocalDate.parse(body.get("endDate").toString()) : null)
                .content(body.get("content") != null ? body.get("content").toString() : null)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }

    @PutMapping("/{id}")
    public Contract update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Contract c = contractRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
        if (body.containsKey("status"))  c.setStatus(Contract.Status.valueOf(body.get("status").toString()));
        if (body.containsKey("title"))   c.setTitle(body.get("title").toString());
        if (body.containsKey("content")) c.setContent(body.get("content").toString());
        return contractRepo.save(c);
    }

    @PutMapping("/{id}/sign")
    public Contract sign(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        Contract c = contractRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));
        String party = body.get("party");
        String sig   = body.get("signature");
        if ("client".equals(party)) {
            c.setClientSignature(sig);
            c.setClientSignedAt(LocalDateTime.now());
        } else {
            c.setAdminSignature(sig);
            c.setAdminSignedAt(LocalDateTime.now());
        }
        if (c.getClientSignature() != null && c.getAdminSignature() != null) {
            c.setStatus(Contract.Status.SIGNED);
        }
        return contractRepo.save(c);
    }
}
