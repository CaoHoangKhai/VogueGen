import axios from "axios";

const API_URL_DESIGN = "http://localhost:4000/design";

export const createDesign = async (data) => {
    const res = await axios.post(`${API_URL_DESIGN}/create`, data);
    // Kết quả trả về: { success: true, message: "...", id: "..." }
    return res.data;
};

export const getDesignsByUser = async (manguoidung) => {
    const res = await axios.get(`${API_URL_DESIGN}/user/${manguoidung}`);
    return res.data;
};

export const getDesignById = async (id) => {
    const res = await axios.get(`${API_URL_DESIGN}/${id}`);
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
    const res = await axios.patch(`${API_URL_DESIGN}/rename/${designId}`, {
        ten: newName
    });
    return res.data;
};

export const deleteDesignById = async (id) => {
    const res = await axios.delete(`${API_URL_DESIGN}/${id}`);
    return res.data;
};
