package edu.cit.nuevas.renteasy.auth;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${google.client-ids:}")
    private String googleClientIds;

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

    public String loginWithGoogle(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google ID token is required");
        }

        JsonNode tokenInfo = verifyGoogleToken(idToken);
        String email = tokenInfo.path("email").asText("").trim().toLowerCase();
        boolean emailVerified = tokenInfo.path("email_verified").asBoolean(false)
                || "true".equalsIgnoreCase(tokenInfo.path("email_verified").asText());

        if (email.isBlank() || !emailVerified) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
        }

        if (adminRepo.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Google sign-in is only available for regular users");
        }

        User user = userRepo.findByEmail(email).orElseGet(() -> createGoogleUser(tokenInfo, email));
        fillMissingGoogleName(user, tokenInfo);
        userRepo.save(user);

        return jwtUtil.generateToken(user.getEmail());
    }

    private JsonNode verifyGoogleToken(String idToken) {
        Set<String> allowedClientIds = allowedGoogleClientIds();
        if (allowedClientIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google client ID is not configured");
        }

        try {
            String encodedToken = URLEncoder.encode(idToken, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodedToken))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
            }

            JsonNode tokenInfo = objectMapper.readTree(response.body());
            String audience = tokenInfo.path("aud").asText("");
            if (!allowedClientIds.contains(audience)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google client ID is not allowed");
            }

            return tokenInfo;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Google sign-in verification failed");
        }
    }

    private Set<String> allowedGoogleClientIds() {
        return java.util.Arrays.stream(googleClientIds.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toSet());
    }

    private User createGoogleUser(JsonNode tokenInfo, String email) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("GOOGLE_AUTH_" + UUID.randomUUID()));
        user.setFirstName(firstNonBlank(tokenInfo.path("given_name").asText(""), tokenInfo.path("name").asText("")));
        user.setLastName(tokenInfo.path("family_name").asText(""));
        return user;
    }

    private void fillMissingGoogleName(User user, JsonNode tokenInfo) {
        if (isBlank(user.getFirstName())) {
            user.setFirstName(firstNonBlank(tokenInfo.path("given_name").asText(""), tokenInfo.path("name").asText("")));
        }
        if (isBlank(user.getLastName())) {
            user.setLastName(tokenInfo.path("family_name").asText(""));
        }
    }

    private String firstNonBlank(String preferred, String fallback) {
        return isBlank(preferred) ? fallback : preferred;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
