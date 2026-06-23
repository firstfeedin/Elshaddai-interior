package com.elshaddai.repository;

import com.elshaddai.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findAllByOrderByNameAsc();
    long countByStatus(Employee.Status status);
}
