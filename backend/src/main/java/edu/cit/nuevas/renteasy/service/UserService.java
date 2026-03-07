package edu.cit.nuevas.renteasy.service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import edu.cit.nuevas.renteasy.dto.LoginRequest;
import edu.cit.nuevas.renteasy.dto.RegisterRequest;
import edu.cit.nuevas.renteasy.model.User;
import edu.cit.nuevas.renteasy.repository.UserRepository;
import edu.cit.nuevas.renteasy.security.JwtUtil;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepo,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String register(RegisterRequest request) {

        if (userRepo.findByEmail(request.email).isPresent()) {
            return "Email already exists";
        }

        User user = new User();
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setPhone(request.phone);
        user.setAddress(request.address);

        userRepo.save(user);

        return "User registered successfully";
    }

    public String login(LoginRequest request) {

        Optional<User> existing = userRepo.findByEmail(request.email);

        if (existing.isEmpty()) {
            return null;
        }

        if (passwordEncoder.matches(request.password, existing.get().getPassword())) {
            return jwtUtil.generateToken(existing.get().getEmail());
        }

        return null;
    }
}