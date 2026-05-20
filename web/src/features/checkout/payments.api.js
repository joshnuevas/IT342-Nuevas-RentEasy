import { apiFetch, authHeaders } from "../../shared/apiClient";

export function createPayMongoCheckout(payload) {
  return apiFetch("/api/payments/paymongo/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
}

export function createOrder(payload) {
  return apiFetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
}

export function updateOrderStatus(orderNumber, status) {
  return apiFetch(`/api/orders/${orderNumber}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ status }),
  });
}
