package edu.cit.nuevas.renteasy.payments;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/paymongo/mobile/success")
    public ResponseEntity<Void> mobileSuccess(@RequestParam(required = false) String reference) {
        return redirectToMobile("success", reference);
    }

    @GetMapping("/paymongo/mobile/cancel")
    public ResponseEntity<Void> mobileCancel(@RequestParam(required = false) String reference) {
        return redirectToMobile("cancelled", reference);
    }

    private ResponseEntity<Void> redirectToMobile(String paymentStatus, String reference) {
        String encodedReference = URLEncoder.encode(reference == null ? "" : reference, StandardCharsets.UTF_8);
        URI location = URI.create(
                "renteasy://paymongo/" + paymentStatus
                        + "?payment=" + paymentStatus
                        + "&provider=paymongo"
                        + "&reference=" + encodedReference
        );
        return ResponseEntity.status(HttpStatus.FOUND).location(location).build();
    }
}
