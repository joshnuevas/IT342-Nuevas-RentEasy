package edu.cit.nuevas.renteasy.users;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.nuevas.renteasy.core.security.JwtUtil;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/me")
    public String me() {
        return "Protected user info";
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authorization) {
        return userForToken(authorization)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Unauthorized")));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Map<String, String> request
    ) {
        return userForToken(authorization)
                .<ResponseEntity<?>>map(user -> {
                    user.setFirstName(clean(request.get("firstName")));
                    user.setLastName(clean(request.get("lastName")));
                    user.setPhone(clean(request.get("phone")));
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Unauthorized")));
    }

    private java.util.Optional<User> userForToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return java.util.Optional.empty();
        }

        String token = authorization.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return java.util.Optional.empty();
        }

        return userRepository.findByEmail(jwtUtil.extractEmail(token));
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}
