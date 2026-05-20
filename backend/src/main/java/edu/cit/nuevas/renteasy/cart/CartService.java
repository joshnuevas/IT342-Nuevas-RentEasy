package edu.cit.nuevas.renteasy.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.nuevas.renteasy.listings.Product;
import edu.cit.nuevas.renteasy.listings.ProductRepository;
import edu.cit.nuevas.renteasy.users.User;
import edu.cit.nuevas.renteasy.users.UserRepository;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CartItem> getUserCart(String email) {
        return cartRepository.findByUser_Email(email);
    }

    @Transactional
    public void addItemToCart(Long productId, String email) {
        Product product = productRepository.findById(productId).orElseThrow();
        User user = userRepository.findByEmail(email).orElseThrow();
        Optional<CartItem> existing = cartRepository.findByProduct_ProductIdAndUser_Email(productId, email);

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setDays(item.getDays() + 1);
            cartRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setDays(1);
            newItem.setUser(user);
            cartRepository.save(newItem);
        }
    }

    public void updateDays(Long id, int days) {
        CartItem item = cartRepository.findById(id).orElseThrow();
        item.setDays(days);
        cartRepository.save(item);
    }

    public void updateQuantity(Long id, int quantity) {
        updateDays(id, quantity);
    }

    public void remove(Long id) {
        cartRepository.deleteById(id);
    }
}
