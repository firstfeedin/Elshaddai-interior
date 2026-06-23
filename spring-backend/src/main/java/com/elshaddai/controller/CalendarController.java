package com.elshaddai.controller;

import com.elshaddai.entity.CalendarEvent;
import com.elshaddai.entity.Project;
import com.elshaddai.entity.User;
import com.elshaddai.repository.CalendarEventRepository;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarEventRepository calRepo;
    private final ProjectRepository       projectRepo;
    private final UserRepository          userRepo;

    @GetMapping
    public List<CalendarEvent> list() {
        return calRepo.findAllByOrderByStartTimeAsc();
    }

    @PostMapping
    public CalendarEvent create(@RequestBody Map<String, Object> body, Authentication auth) {
        Project project = null;
        User    creator = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);
        if (auth != null)
            creator = userRepo.findById((Long) auth.getPrincipal()).orElse(null);

        return calRepo.save(CalendarEvent.builder()
                .title(body.get("title") != null ? body.get("title").toString() : null)
                .description(body.get("description") != null ? body.get("description").toString() : null)
                .startTime(body.get("startTime") != null ? LocalDateTime.parse(body.get("startTime").toString()) : null)
                .endTime(body.get("endTime") != null ? LocalDateTime.parse(body.get("endTime").toString()) : null)
                .location(body.get("location") != null ? body.get("location").toString() : null)
                .type(body.get("type") != null ? CalendarEvent.EventType.valueOf(body.get("type").toString()) : CalendarEvent.EventType.MEETING)
                .project(project)
                .createdBy(creator)
                .build());
    }
}
