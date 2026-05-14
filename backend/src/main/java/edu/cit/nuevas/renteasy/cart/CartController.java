package edu.cit.nuevas.renteasy.cart;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public List<CartItem> get(@RequestParam String email) {
        return cartService.getUserCart(email);
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Map<String, Object> body) {
        Long pId = Long.valueOf(body.get("productId").toString());
        String email = body.get("userEmail").toString();
        cartService.addItemToCart(pId, email);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/quantity")
    public void update(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        cartService.updateQuantity(id, body.get("quantity"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        cartService.remove(id);
    }
}
