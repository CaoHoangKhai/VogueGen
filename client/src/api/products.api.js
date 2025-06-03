// Cấu hình URL cho các khu vực khác nhau
const BASE_URL_HOME = "http://localhost:4000/home";     // Dành cho user/public
const BASE_URL_ADMIN = "http://localhost:4000/admin";   // Dành cho admin quản lý

export const getAllProductsAdmin = async () => {
    try {
        const response = await fetch(`${BASE_URL_ADMIN}/products`);
        if (!response.ok) {
            throw new Error("Không thể lấy danh sách sản phẩm (admin)");
        }
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gọi API admin/products:", error);
        return [];
    }
};
/**
 * Lấy sản phẩm theo ID (chi tiết sản phẩm)
 * @param {string} id - ID của sản phẩm
 * @returns {Promise<Object|null>} Sản phẩm chi tiết hoặc null nếu lỗi
 */
export const getProductById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL_HOME}/products/${id}`);
        if (!response.ok) {
            throw new Error("Không thể lấy sản phẩm theo ID");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy sản phẩm theo ID:", error);
        return null;
    }
};

/**
 * Tạo mới sản phẩm (admin)
 * @param {Object} productData - Dữ liệu sản phẩm mới
 * @returns {Promise<Object|null>} Sản phẩm đã được tạo hoặc null nếu lỗi
 */
export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${BASE_URL_ADMIN}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            throw new Error("Không thể tạo sản phẩm");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi tạo sản phẩm:", error);
        return null;
    }
};

/**
 * Cập nhật sản phẩm theo ID (admin)
 * @param {string} id - ID sản phẩm
 * @param {Object} productData - Dữ liệu cập nhật
 * @returns {Promise<Object|null>} Sản phẩm sau khi cập nhật hoặc null nếu lỗi
 */
export const updateProduct = async (id, productData) => {
    try {
        const response = await fetch(`${BASE_URL_ADMIN}/products/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        });
        if (!response.ok) {
            throw new Error("Không thể cập nhật sản phẩm");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        return null;
    }
};

/**
 * Xóa sản phẩm theo ID (admin)
 * @param {string} id - ID sản phẩm
 * @returns {Promise<boolean>} `true` nếu xóa thành công, ngược lại `false`
 */
export const deleteProduct = async (id) => {
    try {
        const response = await fetch(`${BASE_URL_ADMIN}/products/${id}`, {
            method: "DELETE"
        });
        return response.ok;
    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        return false;
    }
};


/**
 * Lấy danh sách tất cả sản phẩm (hiển thị ở trang chủ)
 * @returns {Promise<Array>} Mảng sản phẩm từ backend
 */
export const getAllProducts = async () => {
    try {
        const response = await fetch(`${BASE_URL_HOME}/products`);
        if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu sản phẩm từ server");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Lỗi khi gọi API sản phẩm:", error);
        return [];
    }
};