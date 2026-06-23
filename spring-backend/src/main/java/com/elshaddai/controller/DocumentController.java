package com.elshaddai.controller;

import com.elshaddai.entity.Document;
import com.elshaddai.entity.Project;
import com.elshaddai.entity.User;
import com.elshaddai.repository.DocumentRepository;
import com.elshaddai.repository.ProjectRepository;
import com.elshaddai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentRepository documentRepo;
    private final ProjectRepository  projectRepo;
    private final UserRepository     userRepo;

    @GetMapping
    public List<Document> list(@RequestParam(required = false) Long project_id) {
        if (project_id != null) return documentRepo.findByProjectId(project_id);
        return documentRepo.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping
    public Document create(@RequestBody Map<String, Object> body, Authentication auth) {
        Project project = null;
        User    uploader = null;
        if (body.get("projectId") != null)
            project = projectRepo.findById(Long.valueOf(body.get("projectId").toString())).orElse(null);
        if (auth != null)
            uploader = userRepo.findById((Long) auth.getPrincipal()).orElse(null);

        return documentRepo.save(Document.builder()
                .name(body.get("name") != null ? body.get("name").toString() : null)
                .fileUrl(body.get("fileUrl") != null ? body.get("fileUrl").toString() : null)
                .fileType(body.get("fileType") != null ? body.get("fileType").toString() : null)
                .category(body.get("category") != null ? body.get("category").toString() : null)
                .project(project)
                .uploadedBy(uploader)
                .notes(body.get("notes") != null ? body.get("notes").toString() : null)
                .build());
    }
}
