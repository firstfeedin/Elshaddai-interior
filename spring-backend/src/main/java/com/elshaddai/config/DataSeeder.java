package com.elshaddai.config;

import com.elshaddai.entity.*;
import com.elshaddai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository            userRepo;
    private final ProjectRepository         projectRepo;
    private final TaskRepository            taskRepo;
    private final EmployeeRepository        employeeRepo;
    private final LeadRepository            leadRepo;
    private final VendorRepository          vendorRepo;
    private final NotificationRepository    notifRepo;
    private final PasswordEncoder           passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) return; // already seeded

        // ── Users ──────────────────────────────────────────────────────
        String hash = passwordEncoder.encode("Password@123");

        User superAdmin = userRepo.save(User.builder()
                .name("Super Admin").email("superadmin@elshaddai.in")
                .passwordHash(hash).role(User.Role.SUPER_ADMIN).isActive(true).build());

        User admin = userRepo.save(User.builder()
                .name("Arjun Sharma").email("admin@elshaddai.in")
                .passwordHash(hash).role(User.Role.ADMIN).isActive(true).build());

        User designer = userRepo.save(User.builder()
                .name("Priya Nair").email("designer@elshaddai.in")
                .passwordHash(hash).role(User.Role.DESIGNER).isActive(true).build());

        User builder = userRepo.save(User.builder()
                .name("Ravi Kumar").email("builder@elshaddai.in")
                .passwordHash(hash).role(User.Role.BUILDER).isActive(true).build());

        User worker = userRepo.save(User.builder()
                .name("Suresh Babu").email("worker@elshaddai.in")
                .passwordHash(hash).role(User.Role.WORKSHOP_WORKER).isActive(true).build());

        User client1 = userRepo.save(User.builder()
                .name("Kavitha Reddy").email("client1@elshaddai.in")
                .passwordHash(hash).role(User.Role.CLIENT).isActive(true).build());

        User client2 = userRepo.save(User.builder()
                .name("Mohan Iyer").email("client2@elshaddai.in")
                .passwordHash(hash).role(User.Role.CLIENT).isActive(true).build());

        // ── Projects ───────────────────────────────────────────────────
        Project p1 = projectRepo.save(Project.builder()
                .name("Kavitha Villa Interiors").clientName("Kavitha Reddy")
                .city("Jubilee Hills, Hyderabad")
                .status(Project.Status.FABRICATION).budget(new BigDecimal("2800000"))
                .startDate(LocalDate.of(2026, 1, 10)).expectedEnd(LocalDate.of(2026, 7, 30))
                .progressPct(45)
                .notes("Full home interior design for 4BHK villa").build());

        Project p2 = projectRepo.save(Project.builder()
                .name("Mohan Office Fitout").clientName("Mohan Iyer")
                .city("Banjara Hills, Hyderabad")
                .status(Project.Status.DESIGN).budget(new BigDecimal("1500000"))
                .startDate(LocalDate.of(2026, 3, 1)).expectedEnd(LocalDate.of(2026, 9, 30))
                .progressPct(15)
                .notes("Modern office fitout for 3000 sqft commercial space").build());

        Project p3 = projectRepo.save(Project.builder()
                .name("Prestige Apartments Lobby").clientName("Prestige Developers")
                .city("Gachibowli, Hyderabad")
                .status(Project.Status.CREATED).budget(new BigDecimal("900000"))
                .startDate(LocalDate.of(2026, 5, 1)).expectedEnd(LocalDate.of(2026, 11, 15))
                .progressPct(0)
                .notes("Premium lobby and common area design").build());

        // ── Tasks ──────────────────────────────────────────────────────
        taskRepo.save(Task.builder().title("Initial site survey").projectId(p1.getId())
                .status(Task.Status.COMPLETED).priority(Task.Priority.HIGH)
                .dueDate(LocalDate.of(2026, 1, 15)).build());
        taskRepo.save(Task.builder().title("Mood board approval").projectId(p1.getId())
                .status(Task.Status.COMPLETED).priority(Task.Priority.HIGH)
                .dueDate(LocalDate.of(2026, 2, 1)).build());
        taskRepo.save(Task.builder().title("Furniture procurement").projectId(p1.getId())
                .status(Task.Status.IN_PROGRESS).priority(Task.Priority.NORMAL)
                .dueDate(LocalDate.of(2026, 4, 30)).build());
        taskRepo.save(Task.builder().title("Flooring installation").projectId(p1.getId())
                .status(Task.Status.PENDING).priority(Task.Priority.NORMAL)
                .dueDate(LocalDate.of(2026, 5, 30)).build());
        taskRepo.save(Task.builder().title("Concept presentation").projectId(p2.getId())
                .status(Task.Status.IN_PROGRESS).priority(Task.Priority.HIGH)
                .dueDate(LocalDate.of(2026, 3, 20)).build());
        taskRepo.save(Task.builder().title("Client brief review").projectId(p3.getId())
                .status(Task.Status.PENDING).priority(Task.Priority.NORMAL)
                .dueDate(LocalDate.of(2026, 5, 10)).build());

        // ── Employees ──────────────────────────────────────────────────
        Employee emp1 = employeeRepo.save(Employee.builder()
                .name("Priya Nair").email("designer@elshaddai.in")
                .role("Senior Designer").department("Design")
                .phone("+91 98765 43210").status(Employee.Status.ACTIVE)
                .joinDate(LocalDate.of(2023, 6, 1)).salary(new BigDecimal("85000")).build());

        Employee emp2 = employeeRepo.save(Employee.builder()
                .name("Ravi Kumar").email("builder@elshaddai.in")
                .role("Project Manager").department("Operations")
                .phone("+91 87654 32109").status(Employee.Status.ACTIVE)
                .joinDate(LocalDate.of(2022, 3, 15)).salary(new BigDecimal("75000")).build());

        Employee emp3 = employeeRepo.save(Employee.builder()
                .name("Suresh Babu").email("worker@elshaddai.in")
                .role("Workshop Supervisor").department("Workshop")
                .phone("+91 76543 21098").status(Employee.Status.ACTIVE)
                .joinDate(LocalDate.of(2021, 9, 1)).salary(new BigDecimal("55000")).build());

        employeeRepo.save(Employee.builder()
                .name("Anita Singh").email("anita@elshaddai.in")
                .role("Junior Designer").department("Design")
                .phone("+91 65432 10987").status(Employee.Status.ACTIVE)
                .joinDate(LocalDate.of(2024, 1, 10)).salary(new BigDecimal("45000")).build());

        // ── Leads ──────────────────────────────────────────────────────
        leadRepo.save(Lead.builder()
                .name("Deepika Menon").email("deepika.menon@gmail.com").phone("+91 91234 56789")
                .city("Kondapur").spaceType("Full Home Interior").budgetRange("20-30L")
                .status(Lead.Status.NEW).message("4BHK apartment in Kondapur").build());

        leadRepo.save(Lead.builder()
                .name("Venkat Rao").email("venkat.rao@outlook.com").phone("+91 80123 45678")
                .city("Hyderabad").spaceType("Kitchen Renovation").budgetRange("8-12L")
                .status(Lead.Status.CONTACTED).message("Modular kitchen + dining area").build());

        leadRepo.save(Lead.builder()
                .name("Sandhya Pillai").email("sandhya.pillai@yahoo.com").phone("+91 79012 34567")
                .city("Madhapur").spaceType("Office Interior").budgetRange("15-25L")
                .status(Lead.Status.QUALIFIED).message("Startup office, 2000 sqft Madhapur").build());

        leadRepo.save(Lead.builder()
                .name("Kiran Reddy").email("kiran.reddy@gmail.com").phone("+91 68901 23456")
                .city("Hyderabad").spaceType("Bedroom Design").budgetRange("3-5L")
                .status(Lead.Status.PROPOSAL).message("Master bedroom + 2 kids rooms").build());

        leadRepo.save(Lead.builder()
                .name("Lakshmi Devi").email("lakshmi.d@gmail.com").phone("+91 57890 12345")
                .city("Hyderabad").spaceType("Living Room").budgetRange("5-8L")
                .status(Lead.Status.WON).message("Premium living + dining setup").build());

        // ── Vendors ────────────────────────────────────────────────────
        vendorRepo.save(Vendor.builder()
                .name("Greenply Industries").contactPerson("Ramesh K")
                .email("ramesh@greenply.in").phone("+91 40 2345 6789")
                .address("Uppal, Hyderabad").category("Plywood & Laminates")
                .status(Vendor.Status.ACTIVE).build());

        vendorRepo.save(Vendor.builder()
                .name("Asian Paints Studio").contactPerson("Nisha M")
                .email("nisha@asianpaints.in").phone("+91 40 3456 7890")
                .address("Ameerpet, Hyderabad").category("Paints & Finishes")
                .status(Vendor.Status.ACTIVE).build());

        vendorRepo.save(Vendor.builder()
                .name("Cera Sanitaryware").contactPerson("Vijay S")
                .email("vijay@cera.in").phone("+91 40 4567 8901")
                .address("Secunderabad").category("Sanitaryware & Hardware")
                .status(Vendor.Status.ACTIVE).build());

        vendorRepo.save(Vendor.builder()
                .name("Sun Ceramics").contactPerson("Prasad R")
                .email("prasad@sunceramics.in").phone("+91 40 5678 9012")
                .address("LB Nagar, Hyderabad").category("Tiles & Flooring")
                .status(Vendor.Status.ACTIVE).build());

        // ── Notifications ──────────────────────────────────────────────
        notifRepo.save(Notification.builder()
                .userId(admin.getId()).title("New lead received")
                .message("Deepika Menon has submitted a project enquiry")
                .type("LEAD").isRead(false).build());

        notifRepo.save(Notification.builder()
                .userId(designer.getId()).title("Task assigned")
                .message("You have been assigned: Furniture procurement for Kavitha Villa")
                .type("TASK").entityType("task").isRead(false).build());

        notifRepo.save(Notification.builder()
                .userId(admin.getId()).title("Project milestone")
                .message("Mood board approval completed for Kavitha Villa Interiors")
                .type("PROJECT").entityType("project").entityId(p1.getId()).isRead(true).build());
    }
}
