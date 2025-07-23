const SizesService = require("../services/sizes.service");
const MongoDB = require("../utils/mongodb.util");

// Lấy tất cả size từ collection "sizesanpham"
exports.getAllSizes = async (req, res) => {
    try {
        const service = new SizesService(MongoDB.client);
        const sizes = await service.getAllSizes();

        if (!sizes || sizes.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy size nào cả." });
        }

        return res.status(200).json(sizes);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách size:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách size." });
    }
};

exports.getSizesByDesignId = async (req, res) => {
    try {
        const { designId } = req.params;

        if (!designId) {
            return res.status(400).json({ message: "Thiếu ID thiết kế." });
        }

        const service = new SizesService(MongoDB.client);
        const sizes = await service.getSizesByDesignId(designId);

        if (!sizes || sizes.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy size cho thiết kế này." });
        }

        return res.status(200).json(sizes);
    } catch (error) {
        console.error("Lỗi khi lấy size theo thiết kế:", error);
        return res.status(500).json({ message: "Lỗi server khi truy xuất size từ thiết kế." });
    }
};