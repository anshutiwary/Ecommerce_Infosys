package com.infosys.backend.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.CheckoutRequest;
import com.infosys.backend.dto.CheckoutResponse;
import com.infosys.backend.model.User;
import com.infosys.backend.service.CheckoutService;
import com.infosys.backend.service.UserService;

@RestController
@RequestMapping("/api")
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final UserService userService;

    public CheckoutController(CheckoutService checkoutService, UserService userService) {
        this.checkoutService = checkoutService;
        this.userService = userService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody(required = false) CheckoutRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());
            String shippingAddress = request == null ? null : request.getShippingAddress();
            CheckoutResponse response = checkoutService.checkout(user, shippingAddress);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            User user = userService.getUserByEmail(authentication.getName());
            return ResponseEntity.ok(checkoutService.getOrdersByUser(user));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<?> getAllOrders() {
        try {
            return ResponseEntity.ok(checkoutService.getAllOrders());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/admin/orders/{orderId}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable int orderId) {
        try {
            return ResponseEntity.ok(checkoutService.approveOrder(orderId));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/orders/checkout/{userId}")
    public ResponseEntity<?> checkoutByUserId(@PathVariable int userId, @RequestBody(required = false) CheckoutRequest request) {
        try {
            User user = userService.getUserById(userId);
            String shippingAddress = request == null ? null : request.getShippingAddress();
            CheckoutResponse response = checkoutService.checkout(user, shippingAddress);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }
}
