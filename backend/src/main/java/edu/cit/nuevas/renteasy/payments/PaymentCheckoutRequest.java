package edu.cit.nuevas.renteasy.payments;

import java.math.BigDecimal;
import java.util.List;

public class PaymentCheckoutRequest {
    private String orderNumber;
    private List<PaymentCheckoutItem> items;
    private PaymentShippingDetails shipping;
    private BigDecimal subtotal;
    private BigDecimal serviceFee;
    private BigDecimal total;

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public List<PaymentCheckoutItem> getItems() {
        return items;
    }

    public void setItems(List<PaymentCheckoutItem> items) {
        this.items = items;
    }

    public PaymentShippingDetails getShipping() {
        return shipping;
    }

    public void setShipping(PaymentShippingDetails shipping) {
        this.shipping = shipping;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getServiceFee() {
        return serviceFee;
    }

    public void setServiceFee(BigDecimal serviceFee) {
        this.serviceFee = serviceFee;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}
