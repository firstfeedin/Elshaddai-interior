package com.elshaddai.controller;

import com.elshaddai.entity.FactoryJob;
import com.elshaddai.entity.Project;
import com.elshaddai.repository.FactoryJobRepository;
import com.elshaddai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/factory-jobs")
@RequiredArgsConstructor
public class FactoryJobController {

    private final FactoryJobRepository jobRepo;
    private final ProjectRepository    projectRepo;

    @GetMapping
    public List<FactoryJob> list() {
        return jobRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public FactoryJob create(@RequestBody Map<String, Object> body) {
        Project project = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);

        return jobRepo.save(FactoryJob.builder()
                .jobNumber(body.get("jobNumber") != null ? body.get("jobNumber").toString() : null)
                .description(body.get("description") != null ? body.get("description").toString() : null)
                .project(project)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }

    @PutMapping("/{id}/stage")
    public FactoryJob updateStage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        FactoryJob job = jobRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factory job not found"));
        job.setStage(FactoryJob.Stage.valueOf(body.get("stage")));
        return jobRepo.save(job);
    }
}
