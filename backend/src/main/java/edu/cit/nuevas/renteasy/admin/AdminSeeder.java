package edu.cit.nuevas.renteasy.admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initDatabase(AdminRepository adminRepository) {
        return args -> {
            seedAdmin(adminRepository, "admin1@renteasy.com", "AdminOne");
            seedAdmin(adminRepository, "admin2@renteasy.com", "AdminTwo");
        };
    }

    private void seedAdmin(AdminRepository repo, String email, String name) {
        if (repo.findByEmail(email).isEmpty()) {
            Admin admin = new Admin();
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode("admin123")); 
            admin.setFirstName(name);
            admin.setLastName("System");
            repo.save(admin);
            System.out.println("Seeded Admin Account: " + email);
        }
    }
}
