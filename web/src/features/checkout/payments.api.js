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
