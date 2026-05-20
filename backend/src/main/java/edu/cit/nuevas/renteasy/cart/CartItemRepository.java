package edu.cit.nuevas.renteasy.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser_Email(String userEmail);
    Optional<CartItem> findByProduct_ProductIdAndUser_Email(Long productId, String userEmail);
    void deleteByProduct_ProductId(Long productId);
}
