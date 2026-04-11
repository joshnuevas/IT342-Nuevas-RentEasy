package edu.cit.nuevas.renteasy.controller;

import edu.cit.nuevas.renteasy.dto.ApiResponse;
import edu.cit.nuevas.renteasy.dto.ProductRequest;
import edu.cit.nuevas.renteasy.model.Product;
import edu.cit.nuevas.renteasy.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173") 
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> addProduct(@RequestBody ProductRequest request) {
        Product newProduct = productService.addProduct(request);
        return ResponseEntity.ok(ApiResponse.success(newProduct));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.ok(ApiResponse.error("Failed to delete product: " + e.getMessage()));
        }
    }
}