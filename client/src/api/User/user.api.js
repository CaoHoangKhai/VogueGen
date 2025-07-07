import axios from 'axios';

const API_BASE_URL_USER = 'http://localhost:4000/user';

// ✅ Lấy thông tin người dùng theo id
export const getUserById = (id) => {
    return axios.get(`${API_BASE_URL_USER}/${id}`);
};

// ✅ Lấy danh sách địa chỉ của người dùng theo userId
export const getUserLocations = (userId) => {
    return axios.get(`${API_BASE_URL_USER}/location/list/${userId}`);
};

// ✅ Thêm địa chỉ mới cho người dùng
export const addUserLocation = (data) => {
    return axios.post(`${API_BASE_URL_USER}/location`, data);
};

// ✅ Xóa địa chỉ theo id
export const deleteUserLocation = (id) => {
    return axios.delete(`${API_BASE_URL_USER}/location/${id}`);
};

export const countFavoritesByUser = (userId) => {
    return axios.get(`${API_BASE_URL_USER}/favorite/${userId}`);
}