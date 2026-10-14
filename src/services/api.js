import axios from "axios";

// Keep the API on the same loopback hostname as Vite. `localhost` and
// `127.0.0.1` are different browser sites, which prevents a SameSite cookie
// issued by one from being sent to the other.
const localApiUrl = `http://${window.location.hostname}:8000`;

// Axios instance pre-configured for the ShopKart backend
const api = axios.create({
  // Override this in .env with VITE_API_URL when deploying.
  baseURL: import.meta.env.VITE_API_URL || localApiUrl,
  withCredentials: true, // send & receive HttpOnly cookies automatically
});

export default api;

// ─── Product Service Functions ──────────────────────────────────────────────

/**
 * Fetch all products. Supports optional search, category, and sort query params.
 * @param {{ search?: string, category?: string, sort?: string }} params
 */
export const fetchProducts = async ({ search = "", category = "", sort = "" } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  if (sort) params.sort = sort;

  const { data } = await api.get("/products", { params });
  return data; // { success, count, products }
};

/**
 * Fetch a single product by its MongoDB _id.
 * @param {string} id
 */
export const fetchProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data; // { success, product }
};

/**
 * Create a new product.
 * @param {object} productData
 */
export const createProduct = async (productData) => {
  const { data } = await api.post("/products", productData);
  return data; // { success, product }
};

// ─── Wishlist Service Functions ─────────────────────────────────────────────

/**
 * Get the current user's wishlist (populated with product data).
 */
export const fetchWishlist = async () => {
  const { data } = await api.get("/wishlist");
  return data; // { success, count, wishlist }
};

/**
 * Add a product to the wishlist.
 * @param {string} productId
 */
export const addToWishlist = async (productId) => {
  const { data } = await api.post(`/wishlist/${productId}`);
  return data; // { success, message }
};

/**
 * Remove a product from the wishlist.
 * @param {string} productId
 */
export const removeFromWishlist = async (productId) => {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data; // { success, message }
};

/**
 * Toggle a product in/out of the wishlist (Bonus).
 * @param {string} productId
 * @returns {{ success: boolean, saved: boolean, message: string }}
 */
export const toggleWishlist = async (productId) => {
  const { data } = await api.patch(`/wishlist/${productId}/toggle`);
  return data; // { success, saved, message }
};

// ─── Cart Service Functions ──────────────────────────────────────────────────

/**
 * Get the current user's cart (populated with product data).
 * @returns {{ success: boolean, cart: Array }}
 */
export const fetchCart = async () => {
  const { data } = await api.get("/cart");
  return data; // { success, cart }
};

/**
 * Add a product to the cart. If already present, increments quantity by 1.
 * @param {string} productId
 * @returns {{ success: boolean, message: string, cart: Array }}
 */
export const addToCart = async (productId) => {
  const { data } = await api.post(`/cart/${productId}`);
  return data; // { success, message, cart }
};

/**
 * Update the quantity of a cart item.
 * @param {string} productId
 * @param {number} quantity
 * @returns {{ success: boolean, message: string, cart: Array }}
 */
export const updateCartItemQuantity = async (productId, quantity) => {
  const { data } = await api.patch(`/cart/${productId}`, { quantity });
  return data; // { success, message, cart }
};

/**
 * Remove a product from the cart.
 * @param {string} productId
 * @returns {{ success: boolean, message: string, cart: Array }}
 */
export const removeFromCart = async (productId) => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data; // { success, message, cart }
};

// ─── Order Service Functions ─────────────────────────────────────────────────

/**
 * Create a Razorpay payment order + ShopKart pending order.
 * The backend validates cart, stock and calculates the total server-side.
 * @param {{ shippingAddress: object }} payload
 * @returns {{ success, shopKartOrderId, razorpayOrderId, amount, currency, key }}
 */
export const createPaymentOrder = async (payload) => {
  const { data } = await api.post("/orders/create-payment-order", payload);
  return data;
};

/**
 * Verify Razorpay payment signature and confirm the ShopKart order.
 * Cart is cleared on the backend only after successful verification.
 * @param {{ shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }} payload
 * @returns {{ success, message, order }}
 */
export const verifyPayment = async (payload) => {
  const { data } = await api.post("/orders/verify-payment", payload);
  return data;
};

/**
 * Fetch all orders for the authenticated user (newest first).
 * @returns {{ success, orders }}
 */
export const fetchOrders = async () => {
  const { data } = await api.get("/orders");
  return data;
};

/**
 * Fetch a single order by ID (ownership enforced on backend).
 * @param {string} orderId
 * @returns {{ success, order }}
 */
export const fetchOrderById = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}`);
  return data;
};

/**
 * Bonus: Update order status (dev/admin only).
 * @param {string} orderId
 * @param {string} status
 */
export const updateOrderStatus = async (orderId, status) => {
  const { data } = await api.patch(`/orders/${orderId}/status`, { status });
  return data;
};
