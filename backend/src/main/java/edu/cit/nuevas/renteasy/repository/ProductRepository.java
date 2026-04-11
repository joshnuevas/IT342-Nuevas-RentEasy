package edu.cit.nuevas.renteasy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.cit.nuevas.renteasy.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(String status);
}