package com.elshaddai.repository;

import com.elshaddai.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();
}
