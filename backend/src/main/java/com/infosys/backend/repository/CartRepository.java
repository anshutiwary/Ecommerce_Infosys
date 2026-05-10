package com.infosys.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infosys.backend.model.Cart;
import com.infosys.backend.model.Product;
import com.infosys.backend.model.User;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    List<Cart> findByUser(User user);

    Optional<Cart> findByUserAndProduct(User user, Product product);

    void deleteByUser(User user);
}
