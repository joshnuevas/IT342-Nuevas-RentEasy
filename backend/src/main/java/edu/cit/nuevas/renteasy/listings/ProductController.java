package edu.cit.nuevas.renteasy.listings;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import edu.cit.nuevas.renteasy.core.security.JwtUtil;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<?> addProduct(
            @RequestBody ProductRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        Product product = productService.addProduct(request, authenticatedEmail(authorization));
        return ResponseEntity.ok(Map.of("success", true, "product", product));
    }

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/mine")
    public List<Product> getMyProducts(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return productService.getProductsForOwner(authenticatedEmail(authorization));
    }

    @GetMapping("/all-approved")
    public List<Product> getAllApproved() {
        return productRepository.findByStatus("APPROVED");
    }

    @GetMapping("/pending")
    public List<Product> getPending() {
        return productRepository.findByStatus("PENDING");
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) return ResponseEntity.notFound().build();
        
        product.setStatus(request.get("status"));
        productRepository.save(product);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    private String authenticatedEmail(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization token is required");
        }

        String token = authorization.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }

        return jwtUtil.extractEmail(token);
    }
}
