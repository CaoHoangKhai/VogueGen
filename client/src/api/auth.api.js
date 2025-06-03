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
