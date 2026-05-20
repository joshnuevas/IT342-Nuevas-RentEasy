package edu.cit.nuevas.renteasy.orders;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.nuevas.renteasy.payments.PaymentCheckoutRequest;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("Authorization") String authorization,
            @RequestBody PaymentCheckoutRequest request
    ) {
        return ResponseEntity.ok(orderService.createOrder(request, authorization));
    }

    @GetMapping("/my")
    public List<OrderResponse> getMyOrders(@RequestHeader("Authorization") String authorization) {
        return orderService.getMyOrders(authorization);
    }

    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{orderNumber}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @RequestHeader("Authorization") String authorization,
            @PathVariable String orderNumber,
            @RequestBody OrderStatusRequest request
    ) {
        return ResponseEntity.ok(orderService.updateStatus(orderNumber, request.getStatus(), authorization));
    }
}
