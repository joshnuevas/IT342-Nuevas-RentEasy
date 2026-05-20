package edu.cit.nuevas.renteasy.auth;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import edu.cit.nuevas.renteasy.admin.Admin;
import edu.cit.nuevas.renteasy.admin.AdminRepository;
import edu.cit.nuevas.renteasy.core.security.JwtUtil;
import edu.cit.nuevas.renteasy.users.User;
import edu.cit.nuevas.renteasy.users.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final AdminRepository adminRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepo,
                       AdminRepository adminRepo,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String register(RegisterRequest request) {

        if (userRepo.findByEmail(request.email).isPresent() || adminRepo.findByEmail(request.email).isPresent()) {
            return "Email already exists";
        }

        User user = new User();
        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        user.setEmail(request.email);
        user.setPhone(request.phone);
        user.setPassword(passwordEncoder.encode(request.password));

        userRepo.save(user);

        return "User registered successfully";
    }

    public String login(LoginRequest request) {

        Optional<User> existing = userRepo.findByEmail(request.email);

        if (existing.isPresent()) {
            User user = existing.get();
            if (passwordEncoder.matches(request.password, user.getPassword())) {
                return jwtUtil.generateToken(user.getEmail());
            }
            return null;
        }

        Optional<Admin> admin = adminRepo.findByEmail(request.email);
        if (admin.isPresent() && passwordEncoder.matches(request.password, admin.get().getPassword())) {
            return jwtUtil.generateToken(admin.get().getEmail());
        }

        return null;
    }
}
