package com.elshaddai.repository;

import com.elshaddai.entity.QcChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QcChecklistRepository extends JpaRepository<QcChecklist, Long> {
    List<QcChecklist> findByProjectId(Long projectId);
}
