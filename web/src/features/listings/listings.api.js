import { apiFetch, authHeaders } from "../../shared/apiClient";

export function getApprovedProducts() {
  return apiFetch("/api/products/all-approved");
}

export function getAllProducts(token) {
  return apiFetch("/api/products", {
    headers: authHeaders(token),
  });
}

export function getPendingProducts(token) {
  return apiFetch("/api/products/pending", {
    headers: authHeaders(token),
  });
}

export function createListing(payload, token) {
  return apiFetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(payload),
  });
}

export function updateProductStatus(id, status, token) {
  return apiFetch(`/api/products/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  });
}

export function deleteProduct(id, token) {
  return apiFetch(`/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}
