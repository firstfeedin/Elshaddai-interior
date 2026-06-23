package com.elshaddai.controller;

import com.elshaddai.entity.Employee;
import com.elshaddai.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeRepository employeeRepo;

    @GetMapping
    public List<Employee> list() {
        return employeeRepo.findAllByOrderByNameAsc();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Employee create(@RequestBody Employee employee, Authentication auth) {
        requireAdmin(auth);
        if (employee.getStatus() == null) employee.setStatus(Employee.Status.ACTIVE);
        return employeeRepo.save(employee);
    }

    @PutMapping("/{id}")
    public Employee update(@PathVariable Long id, @RequestBody Employee body, Authentication auth) {
        requireAdmin(auth);
        Employee e = employeeRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
        if (body.getName()       != null) e.setName(body.getName());
        if (body.getRole()       != null) e.setRole(body.getRole());
        if (body.getDepartment() != null) e.setDepartment(body.getDepartment());
        if (body.getPhone()      != null) e.setPhone(body.getPhone());
        if (body.getEmail()      != null) e.setEmail(body.getEmail());
        if (body.getSalary()     != null) e.setSalary(body.getSalary());
        if (body.getStatus()     != null) e.setStatus(body.getStatus());
        return employeeRepo.save(e);
    }

    private void requireAdmin(Authentication auth) {
        boolean ok = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        if (!ok) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
    }
}
