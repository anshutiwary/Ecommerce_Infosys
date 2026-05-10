package com.infosys.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infosys.backend.model.Order;
import com.infosys.backend.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    List<OrderItem> findByOrder(Order order);
}
