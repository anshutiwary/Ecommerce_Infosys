package com.infosys.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.infosys.backend.dto.AuthResponse;
import com.infosys.backend.dto.PasswordUpdateRequest;
import com.infosys.backend.dto.ProfileUpdateRequest;
import com.infosys.backend.exception.BadRequestException;
import com.infosys.backend.model.User;
import com.infosys.backend.repository.UserRepository;
import com.infosys.backend.security.JwtConfig;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtConfig jwtConfig) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtConfig = jwtConfig;
    }

    public User registerUser(User user) {
        if (user == null) {
            throw new BadRequestException("User details are required");
        }

        String email = normalizeEmail(user.getEmail());
        if (email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        user.setName(trimToNull(user.getName()));
        user.setEmail(email);
        user.setPhone(trimToNull(user.getPhone()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");

        return userRepository.save(user);
    }

    public AuthResponse authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtConfig.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(
                "Login successful",
                token,
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                jwtConfig.getExpirationMs());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserById(int userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Invalid user"));
    }

    public User updateUserProfile(String email, ProfileUpdateRequest profileRequest) {
        User user = getUserByEmail(email);
        user.setName(profileRequest.getName());

        if (profileRequest.getPhone() != null && !profileRequest.getPhone().isBlank()) {
            user.setPhone(profileRequest.getPhone().trim());
        }

        return userRepository.save(user);
    }

    public void updatePassword(String email, PasswordUpdateRequest passwordRequest) {
        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(passwordRequest.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(passwordRequest.getNewPassword()));
        userRepository.save(user);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
