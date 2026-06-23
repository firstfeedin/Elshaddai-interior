package com.elshaddai.controller;

import com.elshaddai.entity.Project;
import com.elshaddai.entity.SiteDiary;
import com.elshaddai.entity.User;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.SiteDiaryRepository;
import com.elshaddai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/site-diary")
@RequiredArgsConstructor
public class SiteDiaryController {

    private final SiteDiaryRepository diaryRepo;
    private final ProjectRepository   projectRepo;
    private final UserRepository      userRepo;

    @GetMapping
    public List<SiteDiary> list(@RequestParam(required = false) Long project_id) {
        if (project_id != null) return diaryRepo.findByProjectIdOrderByEntryDateDesc(project_id);
        return diaryRepo.findAllByOrderByEntryDateDesc();
    }

    @PostMapping
    public SiteDiary create(@RequestBody Map<String, Object> body, Authentication auth) {
        Project project = null;
        User    creator = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);
        if (auth != null)
            creator = userRepo.findById((Long) auth.getPrincipal()).orElse(null);

        return diaryRepo.save(SiteDiary.builder()
                .project(project)
                .entryDate(body.get("entryDate") != null ? LocalDate.parse(body.get("entryDate").toString()) : LocalDate.now())
                .workDone(body.get("workDone") != null ? body.get("workDone").toString() : null)
                .issues(body.get("issues") != null ? body.get("issues").toString() : null)
                .workersOnSite(body.get("workersOnSite") != null ? Integer.valueOf(body.get("workersOnSite").toString()) : null)
                .weather(body.get("weather") != null ? body.get("weather").toString() : null)
                .createdBy(creator)
                .build());
    }
}
