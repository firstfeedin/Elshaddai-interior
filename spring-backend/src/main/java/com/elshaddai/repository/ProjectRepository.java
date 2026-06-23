package com.elshaddai.repository;

import com.elshaddai.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(p) FROM Project p WHERE p.status NOT IN ('COMPLETED', 'CREATED')")
    long countActive();

    @Query("SELECT COALESCE(SUM(p.budget), 0) FROM Project p")
    java.math.BigDecimal totalBudget();
}
