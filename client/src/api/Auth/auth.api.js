import axios from 'axios';

const BASE_URL_AUTH = 'http://localhost:4000/auth';

/**
 * Gửi yêu cầu đăng nhập
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu người dùng
 * @returns {Promise} Promise trả về response từ server
 */
export const signIn = async (email, password) => {
  try {
    const payload = { email, matkhau: password };
    const response = await axios.post(`${BASE_URL_AUTH}/signin`, payload);
    return response;
  } catch (error) {
    // Bắt lỗi và ném tiếp để component gọi xử lý
    throw error;
  }
};

/**
 * Gửi yêu cầu đăng ký tài khoản mới
 * @param {Object} userData - Dữ liệu đăng ký, gồm: hoten, email, sodienthoai, matkhau
 * @returns {Promise} Promise trả về response từ server
 */
export const signUp = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL_AUTH}/signup`, userData);
    return response;
  } catch (error) {
    // Bắt lỗi và ném tiếp để component gọi xử lý
    throw error;
  }
};


/**
 * Gửi yêu cầu đặt hàng
 * @param {Object} orderData - Dữ liệu đơn hàng (xem ví dụ trong prompt)
 * @returns {Promise} Promise trả về response từ server
 */
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${BASE_URL_AUTH}/order`, orderData);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Gửi yêu cầu đổi mật khẩu người dùng
 * @param {string} userId - ID của người dùng
 * @param {string} oldPassword - Mật khẩu cũ
 * @param {string} newPassword - Mật khẩu mới
 * @returns {Promise} Promise trả về response từ server
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const payload = { oldPassword, newPassword };
    const response = await axios.post(
      `${BASE_URL_AUTH}/userId/${userId}/change-password`,
      payload
    );
    return response;
  } catch (error) {
    throw error;
  }
};
