const BASE_URL_SIZE = "http://localhost:4000/size";

export const getAllSizes = async () => {
    const res = await fetch(`${BASE_URL_SIZE}`);
    if (!res.ok) throw new Error("Lỗi khi lấy danh sách kích thước");
    return res.json();
};
export const getSizesByDesignId = async (designId) => {
    const res = await fetch(`${BASE_URL_SIZE}/design/${designId}`);
    if (!res.ok) throw new Error("Lỗi khi lấy size theo designId");
    return res.json();
};
