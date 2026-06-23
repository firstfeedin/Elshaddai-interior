package com.elshaddai.controller;

import com.elshaddai.entity.Project;
import com.elshaddai.entity.ProjectTimeline;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.ProjectTimelineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/timeline")
@RequiredArgsConstructor
public class ProjectTimelineController {

    private final ProjectTimelineRepository timelineRepo;
    private final ProjectRepository         projectRepo;

    @GetMapping
    public List<ProjectTimeline> list(@PathVariable Long projectId) {
        return timelineRepo.findByProjectIdOrderByPlannedDateAsc(projectId);
    }

    @PostMapping
    public ProjectTimeline create(@PathVariable Long projectId, @RequestBody Map<String, Object> body) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        return timelineRepo.save(ProjectTimeline.builder()
                .project(project)
                .milestone(body.get("milestone") != null ? body.get("milestone").toString() : null)
                .plannedDate(body.get("plannedDate") != null ? LocalDate.parse(body.get("plannedDate").toString()) : null)
                .actualDate(body.get("actualDate") != null ? LocalDate.parse(body.get("actualDate").toString()) : null)
                .status(body.get("status") != null ? ProjectTimeline.Status.valueOf(body.get("status").toString()) : ProjectTimeline.Status.PENDING)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }

    @PutMapping("/{id}")
    public ProjectTimeline update(@PathVariable Long projectId, @PathVariable Long id,
                                  @RequestBody Map<String, Object> body) {
        ProjectTimeline tl = timelineRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Timeline entry not found"));
        if (body.containsKey("status"))      tl.setStatus(ProjectTimeline.Status.valueOf(body.get("status").toString()));
        if (body.containsKey("actualDate"))  tl.setActualDate(LocalDate.parse(body.get("actualDate").toString()));
        if (body.containsKey("notes"))       tl.setNotes(body.get("notes").toString());
        return timelineRepo.save(tl);
    }
}
