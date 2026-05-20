package edu.cit.nuevas.renteasy.orders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private String orderNumber;
    private BigDecimal subtotal;
    private BigDecimal serviceFee;
    private BigDecimal total;
    private String status;
    private String customerEmail;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    public OrderResponse(RentalOrder order) {
        this.orderNumber = order.getOrderNumber();
        this.subtotal = order.getSubtotal();
        this.serviceFee = order.getServiceFee();
        this.total = order.getTotal();
        this.status = order.getStatus();
        this.customerEmail = order.getUser() == null ? "" : order.getUser().getEmail();
        this.createdAt = order.getCreatedAt();
        this.items = order.getItems().stream().map(OrderItemResponse::new).toList();
    }

    public String getOrderNumber() { return orderNumber; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getServiceFee() { return serviceFee; }
    public BigDecimal getTotal() { return total; }
    public String getStatus() { return status; }
    public String getCustomerEmail() { return customerEmail; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<OrderItemResponse> getItems() { return items; }
}
