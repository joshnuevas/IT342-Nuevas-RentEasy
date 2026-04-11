package edu.cit.nuevas.renteasy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.nuevas.renteasy.model.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
}