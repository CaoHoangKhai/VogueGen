import axios from 'axios';

const API_BASE_URL_CART = 'http://localhost:4000/cart';

export const addToCart = (data) => {
    // data: { manguoidung, masanpham, soluong, size, mausac }
    return axios.post(`${API_BASE_URL_CART}/add`, data);
};

export const getCartByUserId = (userId) => {
    return axios.get(`${API_BASE_URL_CART}/user/${userId}`);
};

// Tăng số lượng sản phẩm trong giỏ hàng theo _id
export const increaseCartQuantity = (id) => {
    return axios.put(`${API_BASE_URL_CART}/increase/${id}`);
};

// Giảm số lượng sản phẩm trong giỏ hàng theo _id
export const decreaseCartQuantity = (id) => {
    return axios.put(`${API_BASE_URL_CART}/decrease/${id}`);
};

export const updateCartQuantity = (id, data) => {
    // data chỉ cần { soluong: <number> }
    return axios.put(`${API_BASE_URL_CART}/update/${id}`, data);
};