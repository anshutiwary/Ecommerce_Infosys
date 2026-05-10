package com.infosys.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infosys.backend.model.Order;
import com.infosys.backend.model.User;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUser(User user);

    List<Order> findByUserOrderByOrderedAtDesc(User user);

    List<Order> findAllByOrderByOrderedAtDesc();
}
