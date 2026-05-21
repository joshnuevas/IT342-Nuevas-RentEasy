package edu.cit.nuevas.renteasy.listings;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.nuevas.renteasy.cart.CartItemRepository;
import edu.cit.nuevas.renteasy.users.User;
import edu.cit.nuevas.renteasy.users.UserRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    public Product addProduct(ProductRequest request) {
        return addProduct(request, request.getOwnerEmail());
    }

    public Product addProduct(ProductRequest request, String authenticatedOwnerEmail) {
        String ownerEmail = authenticatedOwnerEmail == null || authenticatedOwnerEmail.isBlank()
                ? request.getOwnerEmail()
                : authenticatedOwnerEmail;

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice().doubleValue());
        }
        
        product.setStock(request.getStock());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setOwner(owner);

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getApprovedProducts() {
        return productRepository.findByStatus("APPROVED");
    }

    public List<Product> getPendingProducts() {
        return productRepository.findByStatus("PENDING");
    }

    public List<Product> getProductsForOwner(String ownerEmail) {
        return productRepository.findByOwner_EmailIgnoreCase(ownerEmail);
    }

    public Product updateProductStatus(Long id, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStatus(status);
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Product not found");
        }
        cartItemRepository.deleteByProduct_ProductId(productId);
        productRepository.deleteById(productId);
    }
}
