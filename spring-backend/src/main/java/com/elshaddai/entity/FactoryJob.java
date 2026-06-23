package com.elshaddai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "factory_jobs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FactoryJob {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jobNumber;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Stage stage = Stage.DESIGN;

    private LocalDate startDate;
    private LocalDate targetDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private Employee assignedTo;

    private String notes;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp  private LocalDateTime updatedAt;

    public enum Stage { DESIGN, CUTTING, ASSEMBLY, FINISHING, QC, READY, DELIVERED }
}
