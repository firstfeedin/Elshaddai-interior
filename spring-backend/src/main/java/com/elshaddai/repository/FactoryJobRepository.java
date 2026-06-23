package com.elshaddai.repository;

import com.elshaddai.entity.FactoryJob;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FactoryJobRepository extends JpaRepository<FactoryJob, Long> {
    List<FactoryJob> findAllByOrderByCreatedAtDesc();
    List<FactoryJob> findByProjectId(Long projectId);
}
