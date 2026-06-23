package com.elshaddai.controller;

import com.elshaddai.entity.Project;
import com.elshaddai.entity.Quote;
import com.elshaddai.entity.User;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.QuoteRepository;
import com.elshaddai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteRepository   quoteRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository    userRepo;

    @GetMapping
    public List<Quote> list() {
        return quoteRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Quote create(@RequestBody Map<String, Object> body) {
        Project project = null;
        User    client  = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);
        if (body.get("clientId") != null)
            client = userRepo.findById(Long.valueOf(body.get("clientId").toString())).orElse(null);

        return quoteRepo.save(Quote.builder()
                .quoteNumber(body.get("quoteNumber") != null ? body.get("quoteNumber").toString() : null)
                .title(body.get("title") != null ? body.get("title").toString() : null)
                .project(project)
                .client(client)
                .subtotal(body.get("subtotal") != null ? new BigDecimal(body.get("subtotal").toString()) : null)
                .taxPercent(body.get("taxPercent") != null ? new BigDecimal(body.get("taxPercent").toString()) : null)
                .total(body.get("total") != null ? new BigDecimal(body.get("total").toString()) : null)
                .validUntil(body.get("validUntil") != null ? LocalDate.parse(body.get("validUntil").toString()) : null)
                .lineItems(body.get("lineItems") != null ? body.get("lineItems").toString() : null)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }

    @PatchMapping("/{id}/status")
    public Quote updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Quote q = quoteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found"));
        q.setStatus(Quote.Status.valueOf(body.get("status")));
        return quoteRepo.save(q);
    }
}
