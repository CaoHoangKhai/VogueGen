// api/Order/order.api.js
import axios from "axios";

const BASE_URL_ORDERS = "http://localhost:4000/order";

/**
 * Tạo mới đơn hàng
 * @param {Object} orderData
 * @returns {Promise}
 */
export const createOrder = async (orderData) => {
  const res = await axios.post(`${BASE_URL_ORDERS}`, orderData);
  return res.data;
};

/**
 * Lấy tất cả đơn hàng (chỉ dùng cho admin)
 * @returns {Promise}
 */
export const getAllOrders = async () => {
  const res = await axios.get(`${BASE_URL_ORDERS}`);
  return res.data;
};

/**
 * Lấy danh sách đơn hàng theo userId
 * @param {string} userId
 * @returns {Promise}
 */
export const getOrdersByUserId = async (userId) => {
  const res = await axios.get(`${BASE_URL_ORDERS}/user/${userId}`);
  return res.data;
};

/**
 * Lấy chi tiết đơn hàng theo orderId
 * @param {string} orderId
 * @returns {Promise}
 */
export const getOrderDetailById = async (orderId) => {
  const res = await axios.get(`${BASE_URL_ORDERS}/${orderId}`);
  return res.data;
};

/**
 * Lấy danh sách đơn hàng mới nhất đã xác nhận (dành cho dashboard admin)
 * @returns {Promise}
 */
export const getLatestConfirmedOrders = async () => {
  const res = await axios.get(`${BASE_URL_ORDERS}/latest`);
  return res.data;
};
