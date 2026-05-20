export const categories = ["All", "Cameras", "Tools", "Audio", "Outdoor", "Events"];

const CART_KEY = "renteasy.cart.v2";
const ORDER_KEY = "renteasy.orders.v2";
const PROFILE_KEY = "renteasy.profile.v2";

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function currentUserEmail() {
  return localStorage.getItem("userEmail") || "student@example.com";
}

export function userInitials(email = currentUserEmail()) {
  const name = email.split("@")[0].replace(/[._-]+/g, " ");
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "RE";
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultProfileForEmail(email = currentUserEmail()) {
  if (email === "admin1@renteasy.com") {
    return { name: "Admin One", email, phone: "09XX XXX XXXX", address: "RentEasy Admin Office", avatarUrl: "" };
  }
  if (email === "admin2@renteasy.com") {
    return { name: "Admin Two", email, phone: "09XX XXX XXXX", address: "RentEasy Admin Office", avatarUrl: "" };
  }
  return {
    name: "Josh Anton Nuevas",
    email,
    phone: "09XX XXX XXXX",
    address: "Cebu City",
    avatarUrl: "",
  };
}

export function normalizeProduct(product) {
  return {
    ...product,
    productId: product.productId ?? product.id ?? Date.now(),
    price: Number(product.price) || 0,
    stock: product.stock == null ? 1 : Number(product.stock) || 0,
    category: product.category || "Tools",
    imageUrl: product.imageUrl || product.image || "",
    status: product.status || "APPROVED",
  };
}

export function getVisibleProducts(remoteProducts = []) {
  return remoteProducts
    .map(normalizeProduct)
    .filter((product) => product.status === "APPROVED" && product.stock > 0);
}

export function getPendingListings(remoteProducts = []) {
  return remoteProducts.map(normalizeProduct).filter((product) => product.status === "PENDING");
}

export function setLocalCart(items, email = currentUserEmail()) {
  const carts = readJson(CART_KEY, {});
  carts[email] = items.map(normalizeCartItem);
  writeJson(CART_KEY, carts);
}

export function clearLocalCart(email = currentUserEmail()) {
  setLocalCart([], email);
}

export function calculateCartTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.product?.price || 0) * cartItemDays(item), 0);
}

export function cartItemDays(item) {
  return Math.max(1, Number(item?.days ?? item?.quantity ?? 1) || 1);
}

export function normalizeCartItem(item) {
  return { ...item, days: cartItemDays(item) };
}

export function getStoredOrders() {
  return readJson(ORDER_KEY, []);
}

export function saveStoredOrders(orders) {
  writeJson(ORDER_KEY, orders);
}

export function saveOrder(order) {
  const nextOrder = {
    ...order,
    orderNumber: order.orderNumber || `RE-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    status: order.status || "Processing",
    createdAt: order.createdAt || new Date().toISOString().slice(0, 10),
  };
  writeJson(ORDER_KEY, [nextOrder, ...getStoredOrders()]);
  return nextOrder;
}

export function updateStoredOrder(orderNumber, updates) {
  const orders = getStoredOrders();
  const nextOrders = orders.map((order) =>
    order.orderNumber === orderNumber || order.paymongoReferenceNumber === orderNumber
      ? { ...order, ...updates }
      : order
  );
  saveStoredOrders(nextOrders);
  return nextOrders.find((order) => order.orderNumber === orderNumber || order.paymongoReferenceNumber === orderNumber) || null;
}

export function getProfile() {
  const email = currentUserEmail();
  const stored = readJson(PROFILE_KEY, {});
  if (stored.email && stored.email !== email) {
    return defaultProfileForEmail(email);
  }
  const profile = stored[email] || (stored.email === email ? stored : defaultProfileForEmail(email));
  if (email.endsWith("@renteasy.com") && !profile.name?.toLowerCase().startsWith("admin")) {
    return defaultProfileForEmail(email);
  }
  return { ...defaultProfileForEmail(email), ...profile, email, avatarUrl: profile.avatarUrl || "" };
}

export function saveProfile(profile) {
  const email = profile.email || currentUserEmail();
  const stored = readJson(PROFILE_KEY, {});
  const nextProfiles = stored.email ? {} : stored;
  nextProfiles[email] = { ...profile, email, avatarUrl: profile.avatarUrl || "" };
  writeJson(PROFILE_KEY, nextProfiles);
}
