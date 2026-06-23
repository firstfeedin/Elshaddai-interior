package com.elshaddai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    private String phone;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role = Role.CLIENT;

    private String city;

    @Column(name = "organisation_name")
    private String organisationName;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    private String specialisation;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Role {
        CLIENT, DESIGNER, BUILDER, WORKSHOP_WORKER, ADMIN, SUPER_ADMIN
    }
}
