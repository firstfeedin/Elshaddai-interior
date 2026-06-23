package com.elshaddai.controller;

import com.elshaddai.entity.Employee;
import com.elshaddai.entity.GpsLog;
import com.elshaddai.entity.Project;
import com.elshaddai.repository.EmployeeRepository;
import com.elshaddai.repository.GpsLogRepository;
import com.elshaddai.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gps-logs")
@RequiredArgsConstructor
public class GpsController {

    private final GpsLogRepository  gpsRepo;
    private final EmployeeRepository employeeRepo;
    private final ProjectRepository  projectRepo;

    @GetMapping
    public List<GpsLog> list(@RequestParam(required = false) Long employee_id,
                             @RequestParam(required = false) Long project_id) {
        if (employee_id != null) return gpsRepo.findByEmployeeIdOrderByLoggedAtDesc(employee_id);
        if (project_id != null)  return gpsRepo.findByProjectIdOrderByLoggedAtDesc(project_id);
        return gpsRepo.findAll();
    }

    @PostMapping
    public GpsLog create(@RequestBody Map<String, Object> body) {
        Employee employee = null;
        Project  project  = null;
        if (body.get("employeeId") != null)
            employee = employeeRepo.findById(Long.valueOf(body.get("employeeId").toString())).orElse(null);
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);

        return gpsRepo.save(GpsLog.builder()
                .employee(employee)
                .project(project)
                .latitude(body.get("latitude") != null ? new BigDecimal(body.get("latitude").toString()) : null)
                .longitude(body.get("longitude") != null ? new BigDecimal(body.get("longitude").toString()) : null)
                .address(body.get("address") != null ? body.get("address").toString() : null)
                .build());
    }
}
