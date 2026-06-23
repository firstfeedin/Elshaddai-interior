package com.elshaddai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Project {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_number", unique = true)
    private String projectNumber;

    @Column(nullable = false)
    private String name;

    @Column(name = "client_name")
    private String clientName;

    @Enumerated(EnumType.STRING)
    private Status status = Status.CREATED;

    private BigDecimal budget;
    private String city;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "expected_end")
    private LocalDate expectedEnd;

    @Column(name = "progress_pct")
    private Integer progressPct = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status {
        CREATED, DESIGN, APPROVAL, PROCUREMENT, FABRICATION,
        SITE_WORK, INSTALLATION, HANDOVER, COMPLETED, ON_HOLD
    }
}
