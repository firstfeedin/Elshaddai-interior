package com.elshaddai.repository;

import com.elshaddai.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByOrderByCreatedAtDesc();
    List<Document> findByProjectId(Long projectId);
}
