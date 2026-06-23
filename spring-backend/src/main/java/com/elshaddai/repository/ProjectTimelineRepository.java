package com.elshaddai.repository;

import com.elshaddai.entity.ProjectTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectTimelineRepository extends JpaRepository<ProjectTimeline, Long> {
    List<ProjectTimeline> findByProjectIdOrderByPlannedDateAsc(Long projectId);
}
