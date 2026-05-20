package edu.cit.nuevas.renteasy.orders;

import java.math.BigDecimal;

public class OrderItemResponse {
    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer days;

    public OrderItemResponse(RentalOrderItem item) {
        this.productId = item.getProduct() == null ? null : item.getProduct().getProductId();
        this.productName = item.getProductName();
        this.price = item.getPrice();
        this.days = item.getDays();
    }

    public Long getProductId() { return productId; }
    public String getProductName() { return productName; }
    public BigDecimal getPrice() { return price; }
    public Integer getDays() { return days; }
}
