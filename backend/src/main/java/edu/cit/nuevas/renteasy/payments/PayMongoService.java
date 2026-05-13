package edu.cit.nuevas.renteasy.payments;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PayMongoService {
    private static final URI CHECKOUT_ENDPOINT = URI.create("https://api.paymongo.com/v1/checkout_sessions");

    private final Environment environment;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public PayMongoService(Environment environment, ObjectMapper objectMapper) {
        this(environment, objectMapper, HttpClient.newHttpClient());
    }

    PayMongoService(Environment environment, ObjectMapper objectMapper, HttpClient httpClient) {
        this.environment = environment;
        this.objectMapper = objectMapper;
        this.httpClient = httpClient;
    }

    public PaymentCheckoutResponse createCheckoutSession(PaymentCheckoutRequest request) {
        String secretKey = property("paymongo.secret-key", "PAYMONGO_SECRET_KEY", "");
        if (!StringUtils.hasText(secretKey)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "PayMongo secret key is not configured.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checkout requires at least one cart item.");
        }

        String referenceNumber = StringUtils.hasText(request.getOrderNumber())
                ? request.getOrderNumber()
                : "RE-" + System.currentTimeMillis();
        String frontendUrl = property("app.frontend-url", "APP_FRONTEND_URL", "http://localhost:5173");

        Map<String, Object> attributes = new LinkedHashMap<>();
        attributes.put("billing", buildBilling(request.getShipping()));
        attributes.put("send_email_receipt", true);
        attributes.put("show_description", true);
        attributes.put("show_line_items", true);
        attributes.put("description", "RentEasy rental order " + referenceNumber);
        attributes.put("line_items", buildLineItems(request));
        attributes.put("payment_method_types", paymentMethods());
        attributes.put("success_url", frontendUrl + "/order-confirmation?payment=success&provider=paymongo&reference=" + referenceNumber);
        attributes.put("cancel_url", frontendUrl + "/checkout?payment=cancelled");
        attributes.put("reference_number", referenceNumber);
        attributes.put("metadata", Map.of("order_number", referenceNumber, "source", "RentEasy"));

        Map<String, Object> payload = Map.of("data", Map.of("attributes", attributes));
        String responseBody = sendCheckoutRequest(secretKey, payload);

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode data = root.path("data");
            JsonNode responseAttributes = data.path("attributes");
            String checkoutUrl = responseAttributes.path("checkout_url").asText();
            String sessionId = data.path("id").asText();

            if (!StringUtils.hasText(checkoutUrl)) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "PayMongo did not return a checkout URL.");
            }

            return new PaymentCheckoutResponse(checkoutUrl, sessionId, referenceNumber);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "PayMongo returned an unreadable response.");
        }
    }

    private String sendCheckoutRequest(String secretKey, Map<String, Object> payload) {
        try {
            String encodedCredentials = Base64.getEncoder()
                    .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
            HttpRequest httpRequest = HttpRequest.newBuilder(CHECKOUT_ENDPOINT)
                    .header("Authorization", "Basic " + encodedCredentials)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "PayMongo checkout failed: " + paymongoErrorMessage(response.body())
                );
            }

            return response.body();
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "PayMongo checkout request could not be sent.");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "PayMongo checkout request was interrupted.");
        }
    }

    private List<Map<String, Object>> buildLineItems(PaymentCheckoutRequest request) {
        List<Map<String, Object>> lineItems = new ArrayList<>();
        for (PaymentCheckoutItem item : request.getItems()) {
            if (item.getPrice() == null || !StringUtils.hasText(item.getName())) {
                continue;
            }

            Map<String, Object> lineItem = new LinkedHashMap<>();
            lineItem.put("currency", "PHP");
            lineItem.put("amount", toCentavos(item.getPrice()));
            lineItem.put("description", StringUtils.hasText(item.getDescription()) ? item.getDescription() : item.getName());
            lineItem.put("name", item.getName());
            lineItem.put("quantity", item.getQuantity() == null || item.getQuantity() < 1 ? 1 : item.getQuantity());

            if (StringUtils.hasText(item.getImageUrl()) && item.getImageUrl().startsWith("http")) {
                lineItem.put("images", List.of(item.getImageUrl()));
            }

            lineItems.add(lineItem);
        }

        if (request.getServiceFee() != null && request.getServiceFee().compareTo(BigDecimal.ZERO) > 0) {
            lineItems.add(Map.of(
                    "currency", "PHP",
                    "amount", toCentavos(request.getServiceFee()),
                    "description", "RentEasy platform service fee",
                    "name", "Service fee",
                    "quantity", 1
            ));
        }

        if (lineItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checkout items are incomplete.");
        }

        return lineItems;
    }

    private Map<String, Object> buildBilling(PaymentShippingDetails shipping) {
        if (shipping == null) {
            return Map.of();
        }

        Map<String, Object> billing = new LinkedHashMap<>();
        putIfPresent(billing, "name", shipping.getName());
        putIfPresent(billing, "email", shipping.getEmail());
        putIfPresent(billing, "phone", shipping.getPhone());

        Map<String, Object> address = new LinkedHashMap<>();
        putIfPresent(address, "line1", shipping.getAddress());
        putIfPresent(address, "city", shipping.getCity());
        putIfPresent(address, "postal_code", shipping.getZip());
        address.put("country", "PH");
        billing.put("address", address);

        return billing;
    }

    private void putIfPresent(Map<String, Object> target, String key, String value) {
        if (StringUtils.hasText(value)) {
            target.put(key, value);
        }
    }

    private long toCentavos(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();
    }

    private List<String> paymentMethods() {
        String configuredMethods = property("paymongo.payment-methods", "PAYMONGO_PAYMENT_METHODS", "card,gcash");
        return Arrays.stream(configuredMethods.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    private String paymongoErrorMessage(String responseBody) {
        try {
            JsonNode errors = objectMapper.readTree(responseBody).path("errors");
            if (errors.isArray() && errors.size() > 0) {
                return errors.get(0).path("detail").asText("Invalid PayMongo checkout request.");
            }
        } catch (IOException ignored) {
            return "Invalid PayMongo checkout request.";
        }
        return "Invalid PayMongo checkout request.";
    }

    private String property(String key, String environmentKey, String fallback) {
        String value = environment.getProperty(key);
        if (!StringUtils.hasText(value)) {
            value = environment.getProperty(environmentKey);
        }
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }
}
