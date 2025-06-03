// src/api/product.js

const BASE_URL = "http://localhost:4000/home";

/**
 * Lấy danh sách tất cả sản phẩm
 * @returns {Promise<Array>} Mảng sản phẩm từ backend
 */
export const getAllProducts = async () => {
    try {
        const response = await fetch(`${BASE_URL}/products`);
        if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu sản phẩm từ server");
        }
        const data = await response.json();
        return data; // Trả về mảng sản phẩm
    } catch (error) {
        console.error("Lỗi khi gọi API sản phẩm:", error);
        return []; // Trả về mảng rỗng nếu lỗi
    }
};
