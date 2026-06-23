package com.elshaddai.repository;

import com.elshaddai.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.status NOT IN ('WON', 'LOST')")
    long countActive();
}
