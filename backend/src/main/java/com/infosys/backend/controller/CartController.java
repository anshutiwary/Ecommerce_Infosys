package com.infosys.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.backend.dto.AddToCartRequest;
import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Product;
import com.infosys.backend.model.User;
import com.infosys.backend.service.CartService;
import com.infosys.backend.service.ProductService;
import com.infosys.backend.service.UserService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserService userService;
    private final ProductService productService;

    public CartController(CartService cartService, UserService userService, ProductService productService) {
        this.cartService = cartService;
        this.userService = userService;
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request, Authentication authentication) {
        try {
            User user = userService.getUserByEmail(authentication.getName());
            Product product = productService.getProductById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Cart cart = cartService.addToCart(user, product, request.getQuantity());
            return ResponseEntity.status(HttpStatus.CREATED).body(cart);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Cart>> getCart(Authentication authentication) {
        try {
            User user = userService.getUserByEmail(authentication.getName());
            List<Cart> cartItems = cartService.getCartByUser(user);
            return ResponseEntity.ok(cartItems);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{productId}")
    public ResponseEntity<?> updateCartQuantity(@PathVariable int productId, @RequestBody int quantity, Authentication authentication) {
        try {
            User user = userService.getUserByEmail(authentication.getName());
            boolean updated = cartService.updateCartQuantity(user, productId, quantity);
            if (updated) {
                return ResponseEntity.ok(Map.of("message", "Cart updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Cart item not found"));
            }
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable int productId, Authentication authentication) {
        try {
            User user = userService.getUserByEmail(authentication.getName());
            boolean removed = cartService.removeFromCart(user, productId);
            if (removed) {
                return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Cart item not found"));
            }
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
        }
    }
}