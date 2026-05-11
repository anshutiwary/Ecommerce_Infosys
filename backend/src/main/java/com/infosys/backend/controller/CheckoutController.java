package com.infosys.backend.controller;

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
import com.infosys.backend.exception.UnauthorizedException;
import com.infosys.backend.model.User;
import com.infosys.backend.service.CheckoutService;
import com.infosys.backend.service.UserService;

import jakarta.validation.Valid;

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
    public ResponseEntity<CheckoutResponse> checkout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);
        CheckoutResponse response = checkoutService.checkout(user, request.getShippingAddress(), request.getPaymentMethod());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(checkoutService.getOrdersByUser(user));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<CheckoutResponse> getOrderById(@PathVariable int orderId, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(checkoutService.getOrderById(user, orderId));
    }

    @GetMapping("/admin/orders")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(checkoutService.getAllOrders());
    }

    @PostMapping("/admin/orders/{orderId}/approve")
    public ResponseEntity<CheckoutResponse> approveOrder(@PathVariable int orderId) {
        return ResponseEntity.ok(checkoutService.approveOrder(orderId));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Unauthorized");
        }

        return userService.getUserByEmail(authentication.getName());
    }
}
