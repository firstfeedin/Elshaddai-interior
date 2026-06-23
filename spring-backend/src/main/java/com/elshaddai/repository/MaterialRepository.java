package com.elshaddai.repository;

import com.elshaddai.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByProjectId(Long projectId);
    List<Material> findAllByOrderByCreatedAtDesc();
}
