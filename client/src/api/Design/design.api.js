import axios from "axios";

const API_URL_DESIGN = "http://localhost:4000/design";

export const createDesign = async (data) => {
    const res = await axios.post(`${API_URL_DESIGN}/create`, data);
    // Kết quả trả về: { success: true, message: "...", id: "..." }
    return res.data;
};