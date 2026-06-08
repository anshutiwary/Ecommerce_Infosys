package com.infosys.backend.controller;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.infosys.backend.dto.AuthResponse;
import com.infosys.backend.dto.LoginRequest;
import com.infosys.backend.dto.PasswordUpdateRequest;
import com.infosys.backend.dto.ProfileUpdateRequest;
import com.infosys.backend.model.User;
import com.infosys.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        User registeredUser = userService.registerUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toSafeUserResponse(registeredUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            AuthResponse authResponse = userService.authenticateUser(
                    loginRequest.getEmail(),
                    loginRequest.getPassword());

            boolean secureCookie = isSecureRequest(request);
            String sameSite = secureCookie ? "None" : "Lax";

            ResponseCookie authCookie = ResponseCookie.from("authToken", authResponse.getToken())
                    .httpOnly(true)
                    .secure(secureCookie)
                    .sameSite(sameSite)
                    .path("/")
                    .maxAge(Duration.ofMillis(authResponse.getExpiresInMs()))
                    .build();

            Map<String, Object> responsePayload = toLoginResponse(authResponse);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, authCookie.toString())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + authResponse.getToken())
                    .header(HttpHeaders.CACHE_CONTROL, "no-store")
                    .body(responsePayload);
        } catch (RuntimeException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        boolean secureCookie = isSecureRequest(request);
        String sameSite = secureCookie ? "None" : "Lax";

        ResponseCookie expiredCookie = ResponseCookie.from("authToken", "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());

            return ResponseEntity.ok(toSafeUserResponse(user));
        } catch (RuntimeException ex) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileUpdateRequest profileRequest) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }

        try {
            User updatedUser = userService.updateUserProfile(authentication.getName(), profileRequest);
            return ResponseEntity.ok(toSafeUserResponse(updatedUser));
        } catch (RuntimeException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @Valid @RequestBody PasswordUpdateRequest passwordRequest) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized"));
        }

        try {
            userService.updatePassword(authentication.getName(), passwordRequest);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } catch (RuntimeException ex) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            User user = userService.getUserByEmail(authentication.getName());

            return ResponseEntity.ok(Map.of(
                    "message", "Welcome to your dashboard, " + user.getName() + "!"
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    private Map<String, Object> toSafeUserResponse(User user) {
        Map<String, Object> response = new LinkedHashMap<>();

        response.put("userId", user.getUserId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole());

        return response;
    }

    private Map<String, Object> toLoginResponse(AuthResponse authResponse) {
        Map<String, Object> response = new LinkedHashMap<>();
        Map<String, Object> user = new LinkedHashMap<>();

        response.put("message", authResponse.getMessage());
        response.put("accessToken", authResponse.getToken());
        response.put("token", authResponse.getToken());
        response.put("tokenType", "Bearer");
        response.put("expiresInMs", authResponse.getExpiresInMs());
        response.put("userId", authResponse.getUserId());
        response.put("email", authResponse.getEmail());
        response.put("name", authResponse.getName());
        response.put("role", authResponse.getRole());

        user.put("userId", authResponse.getUserId());
        user.put("email", authResponse.getEmail());
        user.put("name", authResponse.getName());
        user.put("role", authResponse.getRole());
        response.put("user", user);

        return response;
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");

        return request.isSecure() || "https".equalsIgnoreCase(forwardedProto);
    }
}
