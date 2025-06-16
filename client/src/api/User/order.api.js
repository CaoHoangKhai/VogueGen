import axios from 'axios';

const API_BASE_URL_ORDER = 'http://localhost:4000/user/orders';

/**
 * Lấy danh sách đơn hàng theo userId
 * @param {string} userId - ID của người dùng
 * @returns {Promise<object>} - Kết quả từ API (success, data hoặc error)
 */
export const getOrdersByUserId = async (userId) => {
    if (!userId) {
        throw new Error("Thiếu userId để gọi API.");
    }

    try {
        const response = await axios.get(`${API_BASE_URL_ORDER}/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getOrdersByUserId:", error.message);
        // Trả về định dạng tương tự backend để frontend xử lý dễ
        return {
            success: false,
            message: "Không thể lấy đơn hàng từ server.",
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * Lấy chi tiết đơn hàng theo mã đơn hàng (orderId)
 * @param {string} orderId - Mã đơn hàng cần xem chi tiết
 * @returns {Promise<object>} - Kết quả từ API (success, data hoặc error)
 */
export const getOrderDetailById = async (orderId) => {
    if (!orderId) {
        throw new Error("Thiếu orderId để gọi API.");
    }

    try {
        const response = await axios.get(`${API_BASE_URL_ORDER}/detail/${orderId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi gọi API getOrderDetailById:", error.message);
        return {
            success: false,
            message: "Không thể lấy chi tiết đơn hàng từ server.",
            error: error.response?.data?.error || error.message
        };
    }
};