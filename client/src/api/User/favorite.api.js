import axios from 'axios';

const API_BASE_URL_FAVORITE = 'http://localhost:4000/favorite';

// Kiểm tra sản phẩm đã được yêu thích chưa
export const toggleFavorite = async (manguoidung, masanpham) => {
    const payload = { manguoidung, masanpham };
    const response = await axios.post(`${API_BASE_URL_FAVORITE}/toggle`, payload);
    return response.data;
};

// Lấy danh sách sản phẩm yêu thích của người dùng
export const getFavoritesByUser = async (manguoidung) => {
    const response = await axios.get(`${API_BASE_URL_FAVORITE}/user/${manguoidung}`);
    return response.data;
};
// Kiểm tra sản phẩm đã được yêu thích chưa
export const checkIsFavorite = async (manguoidung, masanpham) => {
    const payload = { manguoidung, masanpham };
    const response = await axios.post(`${API_BASE_URL_FAVORITE}/is-favorite`, payload);
    return response.data;
};