import { apiFetch, authHeaders } from "../../shared/apiClient";

export function getCart(userEmail, token) {
  return apiFetch(`/api/cart?email=${encodeURIComponent(userEmail)}`, {
    headers: authHeaders(token),
  });
}

export function addCartItem(productId, userEmail, token) {
  return apiFetch("/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ productId, userEmail }),
  });
}

export function updateCartDays(id, days, token) {
  return apiFetch(`/api/cart/${id}/days`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ days }),
  });
}

export function deleteCartItem(id, token) {
  return apiFetch(`/api/cart/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
