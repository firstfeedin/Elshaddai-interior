package com.elshaddai.controller;

import com.elshaddai.entity.Attendance;
import com.elshaddai.entity.Employee;
import com.elshaddai.repository.AttendanceRepository;
import com.elshaddai.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceRepository attendanceRepo;
    private final EmployeeRepository   employeeRepo;

    @GetMapping
    public List<Attendance> list(@RequestParam(required = false) String date) {
        if (date != null) {
            return attendanceRepo.findByDate(LocalDate.parse(date));
        }
        return attendanceRepo.findAll();
    }

    @PostMapping
    public Attendance create(@RequestBody Map<String, Object> body) {
        Long empId = Long.valueOf(body.get("employeeId").toString());
        Employee emp = employeeRepo.findById(empId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));

        return attendanceRepo.save(Attendance.builder()
                .employee(emp)
                .date(LocalDate.parse(body.get("date").toString()))
                .status(body.get("status") != null
                        ? Attendance.Status.valueOf(body.get("status").toString())
                        : Attendance.Status.PRESENT)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }
}
