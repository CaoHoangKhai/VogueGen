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
