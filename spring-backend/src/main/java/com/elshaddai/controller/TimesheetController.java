package com.elshaddai.controller;

import com.elshaddai.entity.Employee;
import com.elshaddai.entity.Project;
import com.elshaddai.entity.Timesheet;
import com.elshaddai.entity.User;
import com.elshaddai.repository.EmployeeRepository;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.TimesheetRepository;
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
@RequestMapping("/api/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetRepository timesheetRepo;
    private final EmployeeRepository  employeeRepo;
    private final ProjectRepository   projectRepo;
    private final UserRepository      userRepo;

    @GetMapping
    public List<Timesheet> list(@RequestParam(required = false) Long employee_id) {
        if (employee_id != null) return timesheetRepo.findByEmployeeId(employee_id);
        return timesheetRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Timesheet create(@RequestBody Map<String, Object> body) {
        Employee employee = null;
        Project  project  = null;
        if (body.get("employeeId") != null)
            employee = employeeRepo.findById(Long.valueOf(body.get("employeeId").toString())).orElse(null);
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);

        return timesheetRepo.save(Timesheet.builder()
                .employee(employee)
                .project(project)
                .weekStart(body.get("weekStart") != null ? LocalDate.parse(body.get("weekStart").toString()) : null)
                .hoursMonday(body.get("hoursMonday") != null ? new BigDecimal(body.get("hoursMonday").toString()) : null)
                .hoursTuesday(body.get("hoursTuesday") != null ? new BigDecimal(body.get("hoursTuesday").toString()) : null)
                .hoursWednesday(body.get("hoursWednesday") != null ? new BigDecimal(body.get("hoursWednesday").toString()) : null)
                .hoursThursday(body.get("hoursThursday") != null ? new BigDecimal(body.get("hoursThursday").toString()) : null)
                .hoursFriday(body.get("hoursFriday") != null ? new BigDecimal(body.get("hoursFriday").toString()) : null)
                .hoursSaturday(body.get("hoursSaturday") != null ? new BigDecimal(body.get("hoursSaturday").toString()) : null)
                .hoursSunday(body.get("hoursSunday") != null ? new BigDecimal(body.get("hoursSunday").toString()) : null)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }

    @PutMapping("/{id}/approve")
    public Timesheet approve(@PathVariable Long id, Authentication auth) {
        Timesheet ts = timesheetRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Timesheet not found"));
        User approver = userRepo.findById((Long) auth.getPrincipal()).orElse(null);
        ts.setStatus(Timesheet.Status.APPROVED);
        ts.setApprovedAt(LocalDateTime.now());
        ts.setApprovedBy(approver);
        return timesheetRepo.save(ts);
    }
}
