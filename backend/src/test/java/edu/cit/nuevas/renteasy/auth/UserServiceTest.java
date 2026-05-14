package edu.cit.nuevas.renteasy.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import edu.cit.nuevas.renteasy.core.security.JwtUtil;
import edu.cit.nuevas.renteasy.users.User;
import edu.cit.nuevas.renteasy.users.UserRepository;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    @Test
    void registerCreatesUserWhenEmailIsAvailable() {
        RegisterRequest request = new RegisterRequest();
        request.firstName = "Ana";
        request.lastName = "Santos";
        request.email = "ana@example.com";
        request.password = "secret";

        when(userRepository.findByEmail(request.email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.password)).thenReturn("hashed-secret");

        String result = userService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals("User registered successfully", result);
        assertEquals("Ana", savedUser.getFirstName());
        assertEquals("Santos", savedUser.getLastName());
        assertEquals("ana@example.com", savedUser.getEmail());
        assertEquals("hashed-secret", savedUser.getPassword());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.email = "taken@example.com";

        when(userRepository.findByEmail(request.email)).thenReturn(Optional.of(new User()));

        String result = userService.register(request);

        assertEquals("Email already exists", result);
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginReturnsJwtForValidCredentials() {
        LoginRequest request = new LoginRequest();
        request.email = "ana@example.com";
        request.password = "secret";

        User user = new User();
        user.setEmail(request.email);
        user.setPassword("hashed-secret");

        when(userRepository.findByEmail(request.email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password, user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(request.email)).thenReturn("jwt-token");

        String token = userService.login(request);

        assertEquals("jwt-token", token);
    }

    @Test
    void loginRejectsInvalidCredentials() {
        LoginRequest request = new LoginRequest();
        request.email = "ana@example.com";
        request.password = "wrong";

        User user = new User();
        user.setPassword("hashed-secret");

        when(userRepository.findByEmail(request.email)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password, user.getPassword())).thenReturn(false);

        assertNull(userService.login(request));
    }
}
