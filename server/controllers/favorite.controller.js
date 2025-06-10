const MongoDB = require("../utils/mongodb.util");
const FavoriteService = require("../services/favorite.service");

exports.toggleFavorite = async (req, res) => {
    try {
        const service = new FavoriteService(MongoDB.client);
        const result = await service.toggleFavorite(req.body);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi bật/tắt yêu thích:", error);
        return res.status(500).json({ message: "Lỗi server khi xử lý yêu thích." });
    }
};

exports.getFavoritesByUser = async (req, res) => {
    try {
        const { manguoidung } = req.params;
        const service = new FavoriteService(MongoDB.client);
        const result = await service.getFavoritesByUser(manguoidung);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách yêu thích." });
    }
};

exports.isFavorite = async (req, res) => {
    try {
        const service = new FavoriteService(MongoDB.client);
        const exists = await service.isFavorite(req.body);
        return res.status(200).json({ isFavorite: exists });
    } catch (error) {
        console.error("Lỗi khi kiểm tra yêu thích:", error);
        return res.status(500).json({ message: "Lỗi server khi kiểm tra yêu thích." });
    }
};
exports.deleteFavoriteById = async (req, res) => {
    try {
        const favoriteService = new FavoriteService(MongoDB.client);
        const result = await favoriteService.deleteFavoriteById(req.params.id);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi server khi xóa yêu thích." });
    }
};

exports.isFavorite = async (req, res) => {
    try {
        const service = new FavoriteService(MongoDB.client);
        // Nhận manguoidung và masanpham từ body (POST) hoặc query (GET)
        const { manguoidung, masanpham } = req.body;
        if (!manguoidung || !masanpham) {
            return res.status(400).json({ message: "Thiếu thông tin manguoidung hoặc masanpham." });
        }
        const exists = await service.isFavorite({ manguoidung, masanpham });
        return res.status(200).json({ isFavorite: exists });
    } catch (error) {
        console.error("Lỗi khi kiểm tra yêu thích:", error);
        return res.status(500).json({ message: "Lỗi server khi kiểm tra yêu thích." });
    }
};