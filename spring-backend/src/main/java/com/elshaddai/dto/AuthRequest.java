package com.elshaddai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthRequest {

    @Data
    public static class Login {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class Register {
        @NotBlank private String name;
        @NotBlank @Email private String email;
        @NotBlank private String password;
        private String phone;
        private String role;
        private String city;
        private String organisationName;
        private Integer yearsExperience;
        private String specialisation;
    }

    @Data
    public static class GoogleAuth {
        @NotBlank private String credential;
        private String role;
    }

    @Data
    public static class ChangePassword {
        @NotBlank private String currentPassword;
        @NotBlank private String newPassword;
    }

    @Data
    public static class UpdateProfile {
        private String name;
        private String phone;
        private String city;
        private String organisationName;
        private Integer yearsExperience;
        private String specialisation;
    }
}
