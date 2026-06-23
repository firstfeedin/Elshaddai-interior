package com.elshaddai.dto;

import com.elshaddai.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private UserDto user;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String phone;
        private String city;
        private String organisationName;
        private Integer yearsExperience;
        private String specialisation;
        private boolean isActive;
        private LocalDateTime createdAt;

        public static UserDto from(User u) {
            return UserDto.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .role(u.getRole().name())
                    .phone(u.getPhone())
                    .city(u.getCity())
                    .organisationName(u.getOrganisationName())
                    .yearsExperience(u.getYearsExperience())
                    .specialisation(u.getSpecialisation())
                    .isActive(u.isActive())
                    .createdAt(u.getCreatedAt())
                    .build();
        }
    }
}
