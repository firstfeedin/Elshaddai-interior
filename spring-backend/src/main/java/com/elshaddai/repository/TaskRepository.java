package com.elshaddai.repository;

import com.elshaddai.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Task> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status != 'COMPLETED'")
    long countOpen();
}
