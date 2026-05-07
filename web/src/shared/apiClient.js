const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function authHeaders(token = getAuthToken()) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function apiFetch(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, options);
}
