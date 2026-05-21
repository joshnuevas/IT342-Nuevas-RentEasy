package edu.cit.nuevas.renteasy.listings;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(String status);
    List<Product> findByOwner_EmailIgnoreCase(String email);
}
