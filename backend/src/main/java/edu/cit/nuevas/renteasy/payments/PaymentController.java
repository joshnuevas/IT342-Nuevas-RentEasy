package edu.cit.nuevas.renteasy.payments;

import java.util.Map;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PayMongoService payMongoService;

    public PaymentController(PayMongoService payMongoService) {
        this.payMongoService = payMongoService;
    }

    @PostMapping("/paymongo/checkout")
    public ResponseEntity<?> createPayMongoCheckout(@RequestBody PaymentCheckoutRequest request) {
        try {
            return ResponseEntity.ok(payMongoService.createCheckoutSession(request));
        } catch (ResponseStatusException exception) {
            HttpStatusCode statusCode = exception.getStatusCode();
            String detail = exception.getReason() != null
                    ? exception.getReason()
                    : "PayMongo checkout could not be started.";
            return ResponseEntity.status(statusCode).body(Map.of("detail", detail));
        }
    }
}
