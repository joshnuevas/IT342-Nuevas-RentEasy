package edu.cit.nuevas.renteasy.payments;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class PayMongoServiceTest {
    @Mock
    private Environment environment;

    @Test
    void createCheckoutSessionRequiresConfiguredSecretKey() {
        PaymentCheckoutItem item = new PaymentCheckoutItem();
        item.setName("Camera Kit");
        item.setPrice(BigDecimal.valueOf(1200));
        item.setDays(1);

        PaymentCheckoutRequest request = new PaymentCheckoutRequest();
        request.setItems(List.of(item));

        when(environment.getProperty("paymongo.secret-key")).thenReturn("");
        when(environment.getProperty("PAYMONGO_SECRET_KEY")).thenReturn("");

        PayMongoService payMongoService = new PayMongoService(environment, new ObjectMapper());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> payMongoService.createCheckoutSession(request)
        );

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    }
}
