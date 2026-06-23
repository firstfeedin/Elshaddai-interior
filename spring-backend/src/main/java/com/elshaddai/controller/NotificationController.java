package com.elshaddai.controller;

import com.elshaddai.entity.Notification;
import com.elshaddai.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notifRepo;

    @GetMapping
    public List<Notification> list(Authentication auth) {
        return notifRepo.findTop50ByUserIdOrderByCreatedAtDesc((Long) auth.getPrincipal());
    }

    @PutMapping("/{id}/read")
    public Map<String, Boolean> markRead(@PathVariable Long id, Authentication auth) {
        Notification n = notifRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not found"));
        if (!n.getUserId().equals((Long) auth.getPrincipal()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        n.setRead(true);
        notifRepo.save(n);
        return Map.of("ok", true);
    }

    @PutMapping("/read-all")
    public Map<String, Boolean> markAllRead(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        notifRepo.findTop50ByUserIdOrderByCreatedAtDesc(userId).forEach(n -> {
            n.setRead(true);
            notifRepo.save(n);
        });
        return Map.of("ok", true);
    }
}
