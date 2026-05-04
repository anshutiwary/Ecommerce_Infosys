package com.infosys.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Product;
import com.infosys.backend.model.User;
import com.infosys.backend.repository.CartRepository;
import com.infosys.backend.repository.ProductRepository;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public Cart addToCart(User user, Product product, int quantity) {
        Optional<Cart> existingCart = cartRepository.findByUserAndProduct(user, product);

        if (existingCart.isPresent()) {
            Cart cart = existingCart.get();
            cart.setQuantity(cart.getQuantity() + quantity);
            return cartRepository.save(cart);
        } else {
            Cart newCart = new Cart(user, product, quantity);
            return cartRepository.save(newCart);
        }
    }

    public List<Cart> getCartByUser(User user) {
        return cartRepository.findByUser(user);
    }

    public boolean removeFromCart(User user, int productId) {
        Optional<Product> product = productRepository.findById(productId);
        if (product.isPresent()) {
            Optional<Cart> cart = cartRepository.findByUserAndProduct(user, product.get());
            if (cart.isPresent()) {
                cartRepository.delete(cart.get());
                return true;
            }
        }
        return false;
    }

    public boolean updateCartQuantity(User user, int productId, int quantity) {
        Optional<Product> product = productRepository.findById(productId);
        if (product.isPresent()) {
            Optional<Cart> cart = cartRepository.findByUserAndProduct(user, product.get());
            if (cart.isPresent()) {
                cart.get().setQuantity(quantity);
                cartRepository.save(cart.get());
                return true;
            }
        }
        return false;
    }
}