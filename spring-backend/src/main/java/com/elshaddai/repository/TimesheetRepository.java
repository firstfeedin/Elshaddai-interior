package com.elshaddai.repository;

import com.elshaddai.entity.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    List<Timesheet> findAllByOrderByCreatedAtDesc();
    List<Timesheet> findByEmployeeId(Long employeeId);
}
