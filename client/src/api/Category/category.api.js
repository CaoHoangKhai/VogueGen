import axios from "axios";
const BASE_URL_CATEGORY = "http://localhost:4000/category";

export const getProductsByCategory = async (slug) => {
    try {
        const res = await axios.get(`${BASE_URL_CATEGORY}/${slug}`);
        return res.data; // mảng sản phẩm
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm theo category:", error);
        return [];
    }
};
export const getAllCategories = async (slug) => {
    try {
        const res = await axios.get(`${BASE_URL_CATEGORY}/`);
        return res.data; // mảng sản phẩm
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm theo category:", error);
        return [];
    }
};

export const createCategory = async (categoryData) => {
    try {
        const res = await axios.post(`${BASE_URL_CATEGORY}/`, categoryData);
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi khi tạo danh mục:", error?.response?.data || error.message);
        return null;
    }
};
