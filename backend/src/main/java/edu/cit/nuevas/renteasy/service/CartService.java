package edu.cit.nuevas.renteasy.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.nuevas.renteasy.model.CartItem;
import edu.cit.nuevas.renteasy.model.Product;
import edu.cit.nuevas.renteasy.repository.CartItemRepository;
import edu.cit.nuevas.renteasy.repository.ProductRepository;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItem> getUserCart(String email) {
        return cartRepository.findByUserEmail(email);
    }

    @Transactional
    public void addItemToCart(Long productId, String email) {
        Product product = productRepository.findById(productId).orElseThrow();
        Optional<CartItem> existing = cartRepository.findByProductProductIdAndUserEmail(productId, email);

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + 1);
            cartRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(1);
            newItem.setUserEmail(email);
            cartRepository.save(newItem);
        }
    }

    public void updateQuantity(Long id, int qty) {
        CartItem item = cartRepository.findById(id).orElseThrow();
        item.setQuantity(qty);
        cartRepository.save(item);
    }

    public void remove(Long id) {
        cartRepository.deleteById(id);
    }
}