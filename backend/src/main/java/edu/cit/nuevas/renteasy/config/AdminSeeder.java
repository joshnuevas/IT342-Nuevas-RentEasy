package edu.cit.nuevas.renteasy.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import edu.cit.nuevas.renteasy.model.User;
import edu.cit.nuevas.renteasy.repository.UserRepository;

@Configuration
public class AdminSeeder {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            seedAdmin(userRepository, "admin1@renteasy.com", "AdminOne");
            seedAdmin(userRepository, "admin2@renteasy.com", "AdminTwo");
        };
    }

    private void seedAdmin(UserRepository repo, String email, String name) {
        if (repo.findByEmail(email).isEmpty()) {
            User admin = new User();
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode("admin123")); 
            admin.setFirstName(name);
            admin.setLastName("System");
            admin.setRole("ADMIN");
            repo.save(admin);
            System.out.println("Seeded Admin Account: " + email);
        }
    }
}