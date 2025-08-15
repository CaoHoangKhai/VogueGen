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

export const updateProduct = async (productId, formData, opts = {}) => {
  try {
    // ==== Kiểm tra tham số ====
    if (!productId) throw new Error("❌ Thiếu productId khi gọi updateProduct");
    if (!(formData instanceof FormData)) {
      throw new Error("❌ formData phải là instance của FormData");
    }

    const { token = null, timeoutMs = 30000 } = opts;

    // ==== Preview FormData trước khi gửi ====
    const entries = Array.from(formData.entries());
    const fileCount = entries.filter(([, v]) => v instanceof File).length;
    console.groupCollapsed(`[updateProduct] 🔀 Preview FormData — productId=${productId}`);
    console.log(`📦 Tổng entries: ${entries.length}, số file: ${fileCount}`);
    for (const [key, value] of entries) {
      if (value instanceof File) {
        console.log(`   ${key}: File { name: ${value.name}, size: ${value.size}, type: ${value.type} }`);
      } else {
        const s = String(value);
        console.log(`   ${key}: ${s.length > 100 ? s.slice(0, 100) + "… (truncated)" : s}`);
      }
    }
    console.groupEnd();

    // ==== Chuẩn bị request ====
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    console.log(`[updateProduct] 🚀 PUT ${BASE_URL_PRODUCTS}/${productId}`);

    const resp = await fetch(`${BASE_URL_PRODUCTS}/${productId}`, {
      method: "PUT",
      headers, // KHÔNG set Content-Type → browser tự thêm boundary
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // ==== Xử lý phản hồi ====
    let payload;
    const contentType = resp.headers.get("content-type") || "";
    try {
      payload = contentType.includes("application/json")
        ? await resp.json()
        : await resp.text();
    } catch (err) {
      payload = { error: `⚠️ Không parse được response: ${err.message}` };
    }

    if (!resp.ok) {
      console.error("[updateProduct] ❌ Server error:", resp.status, payload);
      return {
        success: false,
        status: resp.status,
        error: payload?.error || payload?.message || `HTTP ${resp.status}`,
      };
    }

    console.log("[updateProduct] ✅ Success:", payload);
    return { success: true, status: resp.status, data: payload };

  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[updateProduct] ⏳ Request timeout");
      return { success: false, error: "Request timeout" };
    }
    console.error("[updateProduct] ❌ Error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
};

export const deleteProduct = async (productId, opts = {}) => {
  try {
    if (!productId) throw new Error("❌ Thiếu productId khi gọi deleteProduct");

    const { token = null, timeoutMs = 30000 } = opts;

    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const resp = await fetch(`${BASE_URL_PRODUCTS}/${productId}`, {
      method: "DELETE",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let payload;
    const contentType = resp.headers.get("content-type") || "";
    try {
      payload = contentType.includes("application/json")
        ? await resp.json()
        : await resp.text();
    } catch (err) {
      payload = { error: `⚠️ Không parse được response: ${err.message}` };
    }

    if (!resp.ok) {
      console.error("[deleteProduct] ❌ Server error:", resp.status, payload);
      return {
        success: false,
        status: resp.status,
        error: payload?.error || payload?.message || `HTTP ${resp.status}`,
      };
    }

    console.log("[deleteProduct] ✅ Success:", payload);
    return { success: true, message: payload?.message || "Xóa sản phẩm thành công" };
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[deleteProduct] ⏳ Request timeout");
      return { success: false, error: "Request timeout" };
    }
    console.error("[deleteProduct] ❌ Error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
};