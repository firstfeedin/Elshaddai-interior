package com.elshaddai.controller;

import com.elshaddai.entity.Task;
import com.elshaddai.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskRepository taskRepo;

    @GetMapping
    public List<Task> list() {
        return taskRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@RequestBody Task task, Authentication auth) {
        task.setCreatedBy((Long) auth.getPrincipal());
        if (task.getStatus()   == null) task.setStatus(Task.Status.PENDING);
        if (task.getPriority() == null) task.setPriority(Task.Priority.NORMAL);
        return taskRepo.save(task);
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task body) {
        Task t = taskRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        if (body.getTitle()       != null) t.setTitle(body.getTitle());
        if (body.getDescription() != null) t.setDescription(body.getDescription());
        if (body.getStatus()      != null) {
            t.setStatus(body.getStatus());
            if (body.getStatus() == Task.Status.COMPLETED) t.setCompletedAt(LocalDateTime.now());
        }
        if (body.getPriority() != null) t.setPriority(body.getPriority());
        if (body.getDueDate()  != null) t.setDueDate(body.getDueDate());
        if (body.getAssignedTo() != null) t.setAssignedTo(body.getAssignedTo());
        return taskRepo.save(t);
    }

    @DeleteMapping("/{id}")
    public Map<String, Boolean> delete(@PathVariable Long id) {
        taskRepo.deleteById(id);
        return Map.of("ok", true);
    }
}
