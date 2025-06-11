const BASE_URL_ADMIN = "http://localhost:4000/admin";

/**
 * Hàm gọi API
 */
const callAPI = async (url, method = "GET", data = null) => {
    try {
        const config = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };
        if (data) config.body = JSON.stringify(data);

        const response = await fetch(`${BASE_URL_ADMIN}${url}`, config);
        if (!response.ok) throw new Error(`Lỗi ${method} tại ${url}`);
        return await response.json();
    } catch (error) {
        console.error(`Lỗi ${method} ${url}:`, error);
        return method === "GET" ? [] : null;
    }
};

// ========== ADMIN ==========
export const getDashboardData = () => callAPI("/dashboard");
export const getListUsers = () => callAPI("/user_list");
export const toggleUserStatus = (id) => callAPI(`/user/status/${id}`, "PATCH");

// ========== PROMOTIONS ==========
export const createPromotions = (data) => callAPI("/promotions", "POST", data);
export const getAllPromotions = () => callAPI("/promotions");
export const deactivatePromotionById = (id) => callAPI(`/promotions/status/${id}`, "PATCH");

// ========== CATEGORIES ==========
export const getAllCategories = () => callAPI("/categories");
export const createCategory = (data) => callAPI("/categories", "POST", data);

// ========== SIZES ==========
export const getAllSizes = () => callAPI("/products/sizes");

// ========== PRODUCTS ==========
export const getAllProducts = () => callAPI("/products");
export const getProductById = (id) => callAPI(`/products/${id}`);
export const searchProducts = (query) => callAPI(`/products/search?q=${encodeURIComponent(query)}`);

// ⚠️ Lưu ý: `createProduct` cần gửi FormData, không dùng callAPI vì không phải JSON
export const createProduct = async (formData) => {
    try {
        const response = await fetch(`${BASE_URL_ADMIN}/products`, {
            method: "POST",
            body: formData,
        });
        if (!response.ok) throw new Error("Lỗi khi tạo sản phẩm");
        return await response.json();
    } catch (error) {
        console.error("Lỗi POST /products:", error);
        return null;
    }
};

export const updateProduct = (id, formData) => {
  return fetch(`${BASE_URL_ADMIN}/products/${id}`, {
    method: "PUT",
    body: formData, // formData chứa cả dữ liệu và file ảnh
  }).then(res => {
    if (!res.ok) throw new Error("Lỗi khi cập nhật sản phẩm");
    return res.json();
  });
};


export const deleteProduct = async (id) => {
    try {
        const res = await fetch(`${BASE_URL_ADMIN}/products/${id}`, {
            method: "DELETE",
        });
        return res.ok;
    } catch (err) {
        console.error("Lỗi DELETE:", err);
        return false;
    }
};

export const updateProductById = async (id, formData) => {
    try {
        const response = await fetch(`${BASE_URL_ADMIN}/products/${id}`, {
            method: "PUT",
            body: formData,
        });
        if (!response.ok) throw new Error("Lỗi khi cập nhật sản phẩm");
        return await response.json();
    } catch (error) {
        console.error("Lỗi PUT /products/:id:", error);
        return null;
    }
};