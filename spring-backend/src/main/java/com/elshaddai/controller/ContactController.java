package com.elshaddai.controller;

import com.elshaddai.entity.ContactMessage;
import com.elshaddai.repository.ContactMessageRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ContactController {

    private final ContactMessageRepository repo;
    private final JavaMailSender           mailSender;

    @Value("${contact.to}")
    private String contactTo;

    @Value("${spring.mail.username:}")
    private String smtpUser;

    @PostMapping("/api/contact")
    public Map<String, Object> contact(@RequestBody Map<String, String> body) {
        String name    = body.get("name");
        String email   = body.get("email");
        String message = body.get("message");

        if (name == null || email == null || message == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email and message are required");

        ContactMessage msg = repo.save(ContactMessage.builder()
                .name(name).email(email).message(message).emailSent(false).build());

        if (smtpUser == null || smtpUser.isBlank()) {
            return Map.of("ok", true, "note", "saved");
        }

        try {
            MimeMessage mail = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(mail, false, "UTF-8");
            h.setFrom(smtpUser);
            h.setTo(contactTo);
            h.setReplyTo(email);
            h.setSubject("New enquiry from " + name + " — El Shaddai");
            h.setText(buildHtml(name, email, message), true);
            mailSender.send(mail);
            msg.setEmailSent(true);
            repo.save(msg);
            return Map.of("ok", true);
        } catch (Exception e) {
            return Map.of("ok", true, "note", "saved");
        }
    }

    @GetMapping("/api/contact-messages")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public List<ContactMessage> list() {
        return repo.findTop100ByOrderByCreatedAtDesc();
    }

    private String buildHtml(String name, String email, String message) {
        return "<div style='font-family:sans-serif;max-width:600px;padding:40px;background:#f8f6f3;border-top:4px solid #c4956a'>" +
               "<h2 style='font-family:Georgia,serif;font-weight:300;color:#0a0a0a;font-size:28px'>New Contact Enquiry</h2>" +
               "<p style='color:#888880;font-size:12px'>Received via elshaddai.in</p>" +
               "<table style='width:100%;background:#fff;border:1px solid #eee'>" +
               "<tr><td style='padding:12px 20px;color:#888;font-size:11px;text-transform:uppercase;border-bottom:1px solid #f0f0f0'>Name</td>" +
               "<td style='padding:12px 20px;border-bottom:1px solid #f0f0f0'>" + name + "</td></tr>" +
               "<tr><td style='padding:12px 20px;color:#888;font-size:11px;text-transform:uppercase;border-bottom:1px solid #f0f0f0'>Email</td>" +
               "<td style='padding:12px 20px;border-bottom:1px solid #f0f0f0'><a href='mailto:" + email + "' style='color:#c4956a'>" + email + "</a></td></tr>" +
               "<tr><td style='padding:12px 20px;color:#888;font-size:11px;text-transform:uppercase;vertical-align:top'>Message</td>" +
               "<td style='padding:12px 20px;line-height:1.8'>" + message.replace("\n", "<br/>") + "</td></tr>" +
               "</table></div>";
    }
}
