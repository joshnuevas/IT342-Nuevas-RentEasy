package edu.cit.nuevas.renteasy.orders;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RentalOrderRepository extends JpaRepository<RentalOrder, Long> {
    Optional<RentalOrder> findByOrderNumber(String orderNumber);
    List<RentalOrder> findByUserEmailOrderByCreatedAtDesc(String email);
    List<RentalOrder> findAllByOrderByCreatedAtDesc();
}
