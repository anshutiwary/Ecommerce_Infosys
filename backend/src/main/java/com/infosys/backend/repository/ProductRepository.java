package com.infosys.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infosys.backend.model.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {
}
