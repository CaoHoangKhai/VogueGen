import axios from "axios";

const API_URL_DESIGN = "http://localhost:4000/design";

export const createDesign = async (data) => {
  const res = await axios.post(`${API_URL_DESIGN}/create`, data);
  // Kết quả trả về: { success: true, message: "...", id: "..." }
  return res.data;
};

export const saveDesign = async (data) => {
  try {
    const res = await axios.post(`${API_URL_DESIGN}/save`, data);
    return res.data;
  } catch (error) {
    console.error("❌ [saveDesign] Lỗi khi gọi API lưu thiết kế:", error);
    throw error; // hoặc return { success: false, error }
  }
};


export const getDesignsByUser = async (manguoidung) => {
  const res = await axios.get(`${API_URL_DESIGN}/user/${manguoidung}`);
  return res.data;
};

export const getDesignDetail = async (designId) => {
  const res = await axios.get(`${API_URL_DESIGN}/${designId}`);
  return res.data;
};

export const saveUserDesign = async ({ designId, tshirtColor, designData }) => {
  const res = await axios.post(`${API_URL_DESIGN}/save-user-design`, {
    designId,
    tshirtColor,
    designData
  });
  return res.data;
};

export const getUserDesignById = async (designId) => {
  const res = await axios.get(`${API_URL_DESIGN}/user-design/${designId}`);
  return res.data;
};

export const renameDesign = async (designId, newName) => {
  const res = await axios.patch(`${API_URL_DESIGN}/rename/${designId}`, { ten: newName });
  return res.data;
};

export const deleteDesignById = async (designId) => {
  const res = await axios.delete(`${API_URL_DESIGN}/${designId}`); // ✅
  return res.data;
};
export const getColorByDesignId = async (id) => {
  const res = await axios.get(`${API_URL_DESIGN}/colors/${id}`);
  return res.data;
}

export const getImagesByColor = async (productId, color) => {
  try {
    if (!productId || !color) throw new Error("Thiếu productId hoặc color.");

    const encodedColor = encodeURIComponent(color);
    const url = `${API_URL_DESIGN}/${productId}/images/${encodedColor}`;

    const res = await axios.get(url);
    if (res.data.success) {
      return res.data.images;
    } else {
      console.warn("Không có ảnh hợp lệ:", res.data.message);
      return [];
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy ảnh theo màu:", error.message);
    return [];
  }
};

/**
 * 🟢 Lấy danh sách size của sản phẩm từ một thiết kế (designId)
 * @param {string} designId - ID của thiết kế
 * @returns {Promise<{ success: boolean, data?: { _id: string, masanpham: string, sizes: string[] }, message?: string }>}
 */
export const getProductSizesFromDesignId = async (designId) => {
  try {
    // Gọi API backend: GET /design/:designId/with-size
    const response = await axios.get(`${API_URL_DESIGN}/${designId}/with-size`);
    return response.data;
  } catch (error) {
    console.error("❌ [getProductSizesFromDesignId] Lỗi khi gọi API:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể lấy size cho thiết kế."
    };
  }
};

