package com.elshaddai.controller;

import com.elshaddai.repository.*;
import com.elshaddai.entity.Employee;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final ProjectRepository  projectRepo;
    private final TaskRepository     taskRepo;
    private final EmployeeRepository employeeRepo;
    private final LeadRepository     leadRepo;
    private final UserRepository     userRepo;

    @GetMapping("/dashboard/summary")
    public Map<String, Object> summary() {
        BigDecimal totalBudget = projectRepo.totalBudget();
        return Map.of(
            "projects",        projectRepo.count(),
            "active_projects", projectRepo.countActive(),
            "open_tasks",      taskRepo.countOpen(),
            "employees",       employeeRepo.countByStatus(Employee.Status.ACTIVE),
            "leads",           leadRepo.countActive(),
            "total_portfolio", totalBudget != null ? totalBudget : BigDecimal.ZERO
        );
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Map<String, Object> adminStats() {
        return Map.of(
            "projects", projectRepo.count(),
            "users",    userRepo.count(),
            "leads",    leadRepo.countActive(),
            "revenue",  projectRepo.totalBudget() != null ? projectRepo.totalBudget() : BigDecimal.ZERO
        );
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Object adminUsers() {
        return userRepo.findAll();
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public Object users() {
        return userRepo.findAll();
    }
}
