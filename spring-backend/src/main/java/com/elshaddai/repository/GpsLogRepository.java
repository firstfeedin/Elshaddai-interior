package com.elshaddai.repository;

import com.elshaddai.entity.GpsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GpsLogRepository extends JpaRepository<GpsLog, Long> {
    List<GpsLog> findByEmployeeIdOrderByLoggedAtDesc(Long employeeId);
    List<GpsLog> findByProjectIdOrderByLoggedAtDesc(Long projectId);
}
