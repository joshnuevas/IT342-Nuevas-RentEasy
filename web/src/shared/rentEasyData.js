export const categories = ["All", "Cameras", "Tools", "Audio", "Outdoor", "Events"];

export const demoProducts = [
  {
    productId: 101,
    name: "Sony Alpha Camera Kit",
    description: "Mirrorless camera with portrait lens, charger, SD card, and weather-sealed travel case.",
    price: 1800,
    stock: 4,
    category: "Cameras",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    status: "APPROVED",
    owner: { firstName: "Mara", lastName: "Reyes", email: "mara@renteasy.com" },
  },
  {
    productId: 102,
    name: "Cordless Drill Set",
    description: "18V drill set with spare battery, driver bits, and compact hard case for weekend projects.",
    price: 420,
    stock: 8,
    category: "Tools",
    imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    status: "APPROVED",
    owner: { firstName: "Luis", lastName: "Tan", email: "luis@renteasy.com" },
  },
  {
    productId: 103,
    name: "Portable PA Speaker",
    description: "Rechargeable event speaker with Bluetooth, microphone input, and two wireless microphones.",
    price: 950,
    stock: 3,
    category: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80",
    status: "APPROVED",
    owner: { firstName: "Nico", lastName: "Lao", email: "nico@renteasy.com" },
  },
  {
    productId: 104,
    name: "Camping Tent Bundle",
    description: "Four-person tent, ground mat, lantern, and compact foldable table for quick outdoor trips.",
    price: 650,
    stock: 5,
    category: "Outdoor",
    imageUrl: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=900&q=80",
    status: "APPROVED",
    owner: { firstName: "Aya", lastName: "Cruz", email: "aya@renteasy.com" },
  },
  {
    productId: 105,
    name: "Folding Banquet Set",
    description: "Six-foot folding table with eight white event chairs, cleaned and ready for pickup.",
    price: 720,
    stock: 6,
    category: "Events",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
    status: "APPROVED",
    owner: { firstName: "Gio", lastName: "Lim", email: "gio@renteasy.com" },
  },
  {
    productId: 106,
    name: "DJ Controller Starter Pack",
    description: "Compact controller, laptop stand, headphones, and signal cables for private events.",
    price: 1250,
    stock: 2,
    category: "Audio",
    imageUrl: "https://images.unsplash.com/photo-1571266028243-d220c9c3b389?auto=format&fit=crop&w=900&q=80",
    status: "APPROVED",
    owner: { firstName: "Bea", lastName: "Sy", email: "bea@renteasy.com" },
  },
];

export const demoPendingListings = [
  {
    productId: 901,
    name: "LED Video Light Kit",
    description: "Two adjustable LED panels with stands and carrying bag.",
    price: 780,
    stock: 2,
    category: "Cameras",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    status: "PENDING",
    owner: { firstName: "Josh", lastName: "Nuevas", email: "student@example.com" },
  },
];

export const demoOrders = [
  {
    orderNumber: "RE-2026-001",
    status: "Processing",
    total: 3600,
    createdAt: "2026-05-13",
    items: [{ name: "Sony Alpha Camera Kit", quantity: 2, price: 1800 }],
    shipping: { name: "Josh Nuevas", city: "Cebu City", address: "Cebu IT Park", zip: "6000" },
  },
];

const CART_KEY = "renteasy.cart.v2";
const LISTING_KEY = "renteasy.listings.v2";
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

export function normalizeProduct(product) {
  return {
    ...product,
    productId: product.productId ?? product.id ?? Date.now(),
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 1,
    category: product.category || "Tools",
    imageUrl: product.imageUrl || product.image || "",
    status: product.status || "APPROVED",
  };
}

export function getStoredListings() {
  return readJson(LISTING_KEY, []);
}

export function saveStoredListing(payload) {
  const listings = getStoredListings();
  const listing = normalizeProduct({
    ...payload,
    productId: Date.now(),
    status: "PENDING",
    owner: {
      firstName: "Josh",
      lastName: "Nuevas",
      email: currentUserEmail(),
    },
    createdAt: new Date().toISOString(),
  });
  writeJson(LISTING_KEY, [listing, ...listings]);
  return listing;
}

export function updateStoredListingStatus(productId, status) {
  const listings = getStoredListings().map((item) =>
    String(item.productId) === String(productId) ? { ...item, status } : item
  );
  writeJson(LISTING_KEY, listings);
}

export function getVisibleProducts(remoteProducts = []) {
  const normalizedRemote = remoteProducts.map(normalizeProduct);
  const storedApproved = getStoredListings().filter((item) => item.status === "APPROVED").map(normalizeProduct);
  return normalizedRemote.length > 0
    ? [...storedApproved, ...normalizedRemote]
    : [...storedApproved, ...demoProducts];
}

export function findProductById(productId, remoteProducts = []) {
  const allProducts = [
    ...getStoredListings(),
    ...remoteProducts,
    ...demoProducts,
    ...demoPendingListings,
  ].map(normalizeProduct);
  return allProducts.find((product) => String(product.productId) === String(productId));
}

export function getPendingListings(remoteProducts = []) {
  const storedPending = getStoredListings().filter((item) => item.status === "PENDING").map(normalizeProduct);
  const remotePending = remoteProducts.map(normalizeProduct);
  return remotePending.length > 0 ? [...storedPending, ...remotePending] : [...storedPending, ...demoPendingListings];
}

export function getLocalCart(email = currentUserEmail()) {
  const carts = readJson(CART_KEY, {});
  return carts[email] || [];
}

export function setLocalCart(items, email = currentUserEmail()) {
  const carts = readJson(CART_KEY, {});
  carts[email] = items;
  writeJson(CART_KEY, carts);
}

export function addProductToLocalCart(product, email = currentUserEmail()) {
  const normalized = normalizeProduct(product);
  const items = getLocalCart(email);
  const existing = items.find((item) => String(item.product.productId) === String(normalized.productId));
  const nextItems = existing
    ? items.map((item) =>
        String(item.product.productId) === String(normalized.productId)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    : [{ id: normalized.productId, product: normalized, quantity: 1 }, ...items];
  setLocalCart(nextItems, email);
  return nextItems;
}

export function updateLocalCartQuantity(id, quantity, email = currentUserEmail()) {
  const nextItems = getLocalCart(email).map((item) =>
    String(item.id) === String(id) ? { ...item, quantity } : item
  );
  setLocalCart(nextItems, email);
  return nextItems;
}

export function removeLocalCartItem(id, email = currentUserEmail()) {
  const nextItems = getLocalCart(email).filter((item) => String(item.id) !== String(id));
  setLocalCart(nextItems, email);
  return nextItems;
}

export function clearLocalCart(email = currentUserEmail()) {
  setLocalCart([], email);
}

export function calculateCartTotal(items) {
  return items.reduce((sum, item) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0), 0);
}

export function getStoredOrders() {
  return readJson(ORDER_KEY, []);
}

export function saveOrder(order) {
  const nextOrder = {
    ...order,
    orderNumber: `RE-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    status: "Processing",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  writeJson(ORDER_KEY, [nextOrder, ...getStoredOrders()]);
  return nextOrder;
}

export function getProfile() {
  return readJson(PROFILE_KEY, {
    name: "Josh Anton Nuevas",
    email: currentUserEmail(),
    phone: "09XX XXX XXXX",
    address: "Cebu City",
  });
}

export function saveProfile(profile) {
  writeJson(PROFILE_KEY, profile);
}
