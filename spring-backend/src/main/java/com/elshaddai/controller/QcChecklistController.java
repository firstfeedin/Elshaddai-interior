package com.elshaddai.controller;

import com.elshaddai.entity.Project;
import com.elshaddai.entity.QcChecklist;
import com.elshaddai.entity.User;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.QcChecklistRepository;
import com.elshaddai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qc-checklists")
@RequiredArgsConstructor
public class QcChecklistController {

    private final QcChecklistRepository qcRepo;
    private final ProjectRepository     projectRepo;
    private final UserRepository        userRepo;

    @GetMapping("/{projectId}")
    public List<QcChecklist> list(@PathVariable Long projectId) {
        return qcRepo.findByProjectId(projectId);
    }

    @PostMapping
    public QcChecklist create(@RequestBody Map<String, Object> body) {
        Project project = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);

        return qcRepo.save(QcChecklist.builder()
                .project(project)
                .stage(body.get("stage") != null ? body.get("stage").toString() : null)
                .item(body.get("item") != null ? body.get("item").toString() : null)
                .remarks(body.get("remarks") != null ? body.get("remarks").toString() : null)
                .build());
    }

    @PutMapping("/{id}")
    public QcChecklist update(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        QcChecklist qc = qcRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Checklist item not found"));
        if (body.containsKey("passed"))  qc.setPassed((Boolean) body.get("passed"));
        if (body.containsKey("remarks")) qc.setRemarks(body.get("remarks").toString());
        if (auth != null) {
            qc.setCheckedBy(userRepo.findById((Long) auth.getPrincipal()).orElse(null));
            qc.setCheckedAt(LocalDateTime.now());
        }
        return qcRepo.save(qc);
    }
}
