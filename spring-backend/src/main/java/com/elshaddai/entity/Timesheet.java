package com.elshaddai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "timesheets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Timesheet {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    private LocalDate weekStart;
    private BigDecimal hoursMonday;
    private BigDecimal hoursTuesday;
    private BigDecimal hoursWednesday;
    private BigDecimal hoursThursday;
    private BigDecimal hoursFriday;
    private BigDecimal hoursSaturday;
    private BigDecimal hoursSunday;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.DRAFT;

    private String notes;
    private LocalDateTime approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp  private LocalDateTime updatedAt;

    public enum Status { DRAFT, SUBMITTED, APPROVED, REJECTED }
}
