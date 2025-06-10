// favorite.api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/favorite';

// Gửi yêu cầu toggle yêu thích (thêm hoặc xóa nếu đã có)
export const toggleFavorite = async (manguoidung, masanpham) => {
    const payload = { manguoidung, masanpham };
    const response = await axios.post(`${API_BASE_URL}/toggle`, payload);
    return response.data;
};

// Lấy danh sách sản phẩm yêu thích của người dùng
export const getFavoritesByUser = async (manguoidung) => {
    const response = await axios.get(`${API_BASE_URL}/user/${manguoidung}`);
    return response.data;
};

// Kiểm tra sản phẩm đã được yêu thích chưa
export const checkIsFavorite = async (manguoidung, masanpham) => {
    const payload = { manguoidung, masanpham };
    const response = await axios.post(`${API_BASE_URL}/is-favorite`, payload);
    return response.data;
};

// Xóa sản phẩm yêu thích theo mayeuthich (id bản ghi yêu thích)
export const deleteFavoriteById = async (mayeuthich) => {
    const response = await axios.delete(`${API_BASE_URL}/${mayeuthich}`);
    return response.data;
};