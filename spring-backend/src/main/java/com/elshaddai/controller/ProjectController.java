package com.elshaddai.controller;

import com.elshaddai.entity.Project;
import com.elshaddai.entity.Task;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepo;
    private final TaskRepository    taskRepo;

    @GetMapping
    public List<Project> list() {
        return projectRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Project create(@RequestBody Project project) {
        return projectRepo.save(project);
    }

    @GetMapping("/{id}")
    public Project get(@PathVariable Long id) {
        return projectRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    @PutMapping("/{id}")
    public Project update(@PathVariable Long id, @RequestBody Project body) {
        Project p = projectRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (body.getName()        != null) p.setName(body.getName());
        if (body.getClientName()  != null) p.setClientName(body.getClientName());
        if (body.getStatus()      != null) p.setStatus(body.getStatus());
        if (body.getBudget()      != null) p.setBudget(body.getBudget());
        if (body.getCity()        != null) p.setCity(body.getCity());
        if (body.getStartDate()   != null) p.setStartDate(body.getStartDate());
        if (body.getExpectedEnd() != null) p.setExpectedEnd(body.getExpectedEnd());
        if (body.getProgressPct() != null) p.setProgressPct(body.getProgressPct());
        if (body.getNotes()       != null) p.setNotes(body.getNotes());
        return projectRepo.save(p);
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> delete(@PathVariable Long id, Authentication auth) {
        requireAdmin(auth);
        taskRepo.findByProjectIdOrderByCreatedAtDesc(id).forEach(taskRepo::delete);
        projectRepo.deleteById(id);
        return Map.of("ok", true);
    }

    // ── Tasks per project ─────────────────────────────────────────
    @GetMapping("/{id}/tasks")
    public List<Task> getTasks(@PathVariable Long id) {
        return taskRepo.findByProjectIdOrderByCreatedAtDesc(id);
    }

    @PostMapping("/{id}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public Task createTask(@PathVariable Long id, @RequestBody Task task, Authentication auth) {
        task.setProjectId(id);
        task.setCreatedBy((Long) auth.getPrincipal());
        if (task.getStatus()   == null) task.setStatus(Task.Status.PENDING);
        if (task.getPriority() == null) task.setPriority(Task.Priority.NORMAL);
        return taskRepo.save(task);
    }

    private void requireAdmin(Authentication auth) {
        boolean ok = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (!ok) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
    }
}
