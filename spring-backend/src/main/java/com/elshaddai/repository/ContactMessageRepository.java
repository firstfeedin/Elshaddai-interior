package com.elshaddai.repository;

import com.elshaddai.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    List<ContactMessage> findTop100ByOrderByCreatedAtDesc();
}
