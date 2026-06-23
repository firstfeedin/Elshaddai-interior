package com.elshaddai.repository;

import com.elshaddai.entity.SiteDiary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SiteDiaryRepository extends JpaRepository<SiteDiary, Long> {
    List<SiteDiary> findByProjectIdOrderByEntryDateDesc(Long projectId);
    List<SiteDiary> findAllByOrderByEntryDateDesc();
}
