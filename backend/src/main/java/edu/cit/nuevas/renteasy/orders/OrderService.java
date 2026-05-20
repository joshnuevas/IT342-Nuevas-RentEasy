package edu.cit.nuevas.renteasy.orders;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import edu.cit.nuevas.renteasy.core.security.JwtUtil;
import edu.cit.nuevas.renteasy.listings.Product;
import edu.cit.nuevas.renteasy.listings.ProductRepository;
import edu.cit.nuevas.renteasy.payments.PaymentCheckoutItem;
import edu.cit.nuevas.renteasy.payments.PaymentCheckoutRequest;
import edu.cit.nuevas.renteasy.payments.PaymentDeliveryDetails;
import edu.cit.nuevas.renteasy.users.User;
import edu.cit.nuevas.renteasy.users.UserRepository;

@Service
public class OrderService {

    private final RentalOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OrderService(
            RentalOrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            JwtUtil jwtUtil
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public OrderResponse createOrder(PaymentCheckoutRequest request, String authorization) {
        User user = userForToken(authorization);
        if (!StringUtils.hasText(request.getOrderNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order number is required.");
        }

        RentalOrder order = orderRepository.findByOrderNumber(request.getOrderNumber())
                .orElseGet(RentalOrder::new);

        order.setOrderNumber(request.getOrderNumber());
        order.setUser(user);
        order.setSubtotal(valueOrZero(request.getSubtotal()));
        order.setServiceFee(valueOrZero(request.getServiceFee()));
        order.setTotal(valueOrZero(request.getTotal()));
        if (!StringUtils.hasText(order.getStatus())) {
            order.setStatus("Awaiting PayMongo payment");
        }
        applyDelivery(order, request.getDelivery());

        order.getItems().clear();
        if (request.getItems() != null) {
            for (PaymentCheckoutItem checkoutItem : request.getItems()) {
                order.getItems().add(toOrderItem(order, checkoutItem));
            }
        }

        return new OrderResponse(orderRepository.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(String authorization) {
        User user = userForToken(authorization);
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(user.getEmail())
                .stream()
                .map(OrderResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(OrderResponse::new)
                .toList();
    }

    @Transactional
    public OrderResponse updateStatus(String orderNumber, String status, String authorization) {
        User user = userForToken(authorization);
        RentalOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found."));

        boolean ownsOrder = order.getUser() != null && user.getEmail().equalsIgnoreCase(order.getUser().getEmail());
        boolean isAdmin = user.getEmail().equalsIgnoreCase("admin1@renteasy.com")
                || user.getEmail().equalsIgnoreCase("admin2@renteasy.com");
        if (!ownsOrder && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot update this order.");
        }

        order.setStatus(StringUtils.hasText(status) ? status : order.getStatus());
        return new OrderResponse(orderRepository.save(order));
    }

    private RentalOrderItem toOrderItem(RentalOrder order, PaymentCheckoutItem checkoutItem) {
        RentalOrderItem item = new RentalOrderItem();
        item.setOrder(order);
        Product product = checkoutItem.getProductId() == null
                ? null
                : productRepository.findById(checkoutItem.getProductId()).orElse(null);
        item.setProduct(product);
        item.setProductName(StringUtils.hasText(checkoutItem.getName())
                ? checkoutItem.getName()
                : product == null ? "Rental item" : product.getName());
        item.setPrice(valueOrZero(checkoutItem.getPrice()));
        item.setDays(checkoutItem.getDays() == null || checkoutItem.getDays() < 1 ? 1 : checkoutItem.getDays());
        return item;
    }

    private void applyDelivery(RentalOrder order, PaymentDeliveryDetails delivery) {
        if (delivery == null) return;
        order.setDeliveryName(delivery.getName());
        order.setDeliveryEmail(delivery.getEmail());
        order.setDeliveryPhone(delivery.getPhone());
        order.setDeliveryAddress(delivery.getAddress());
        order.setDeliveryCity(delivery.getCity());
        order.setDeliveryZip(delivery.getZip());
    }

    private User userForToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String token = authorization.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
