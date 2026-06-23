package com.elshaddai.repository;

import com.elshaddai.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
    List<Quote> findAllByOrderByCreatedAtDesc();
    List<Quote> findByProjectId(Long projectId);
}
