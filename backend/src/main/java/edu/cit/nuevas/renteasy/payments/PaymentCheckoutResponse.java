package edu.cit.nuevas.renteasy.payments;

public class PaymentCheckoutResponse {
    private String checkoutUrl;
    private String sessionId;
    private String referenceNumber;

    public PaymentCheckoutResponse(String checkoutUrl, String sessionId, String referenceNumber) {
        this.checkoutUrl = checkoutUrl;
        this.sessionId = sessionId;
        this.referenceNumber = referenceNumber;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }
}
