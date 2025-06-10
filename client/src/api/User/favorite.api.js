import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/favorite';

// Kiểm tra sản phẩm đã được yêu thích chưa
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