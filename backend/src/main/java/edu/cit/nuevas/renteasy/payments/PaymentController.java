package edu.cit.nuevas.renteasy.payments;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PayMongoService payMongoService;

    public PaymentController(PayMongoService payMongoService) {
        this.payMongoService = payMongoService;
    }

    @PostMapping("/paymongo/checkout")
    public ResponseEntity<PaymentCheckoutResponse> createPayMongoCheckout(@RequestBody PaymentCheckoutRequest request) {
        return ResponseEntity.ok(payMongoService.createCheckoutSession(request));
    }
}
