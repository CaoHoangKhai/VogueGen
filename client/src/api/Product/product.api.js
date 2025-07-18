import axios from "axios";

const BASE_URL_PRODUCTS = "http://localhost:4000/products";

// 📌 Lấy toàn bộ sản phẩm (nếu có route này)
export const getAllProducts = async () => {
    try {
        const res = await axios.get(`${BASE_URL_PRODUCTS}`);
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy tất cả sản phẩm:", error);
        return [];
    }
};

// 📌 Lấy sản phẩm theo ID
export const getProductById = async (id) => {
    try {
        const res = await axios.get(`${BASE_URL_PRODUCTS}/${id}`);
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy chi tiết sản phẩm:", error);
        return null;
    }
};

// 📌 Lấy danh sách màu sắc theo ID sản phẩm
export const getColorsByProductId = async (productId) => {
    try {
        const res = await axios.get(`${BASE_URL_PRODUCTS}/${productId}/colors`);
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy màu sắc sản phẩm:", error);
        return [];
    }
};



// 📌 Lấy danh sách ảnh theo màu sản phẩm
export const getImagesByColor = async (productId, colorCode) => {
    try {
        const encodedColor = encodeURIComponent(colorCode); // ← thêm dòng này
        const res = await axios.get(`${BASE_URL_PRODUCTS}/${productId}/images/${encodedColor}`);
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy ảnh theo màu sản phẩm:", error);
        return [];
    }
};


// 📌 Lấy danh sách sản phẩm theo slug danh mục (category)
export const getProductsByCategorySlug = async (slug) => {
    try {
        const res = await axios.get(`${BASE_URL_PRODUCTS}/category/${slug}`);
        return res.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm theo danh mục:", error);
        return [];
    }
};
export const createProduct = async (formData) => {
    try {
        const response = await fetch(`${BASE_URL_PRODUCTS}/products`, {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("❌ Server trả lỗi:", result);
            throw new Error(result?.error || "Lỗi không xác định từ server");
        }

        return result; // ví dụ: { message: "Tạo sản phẩm thành công", id, ... }
    } catch (error) {
        console.error("❌ Lỗi POST /products:", error);
        return { success: false, error: error.message };
    }
};

// 📌 Lấy top sản phẩm bán chạy (mặc định là 5)
export const getTopSellingProducts = async () => {
    try {
        const res = await axios.get(`${BASE_URL_PRODUCTS}/best-selling`);
        return res.data.products; // hoặc res.data tùy theo structure bạn trả từ server
    } catch (error) {
        console.error("❌ Lỗi khi lấy sản phẩm bán chạy:", error);
        return [];
    }
};
