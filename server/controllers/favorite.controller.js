const MongoDB = require("../utils/mongodb.util");
const FavoriteService = require("../services/favorite.service");

// 🔁 Thêm / xóa yêu thích
exports.toggleFavorite = async (req, res) => {
    try {
        console.log("🔄 [toggleFavorite] Body:", req.body);

        const service = new FavoriteService(MongoDB.client);
        const result = await service.toggleFavorite(req.body);

        console.log("✅ [toggleFavorite] Kết quả:", result);
        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ Lỗi khi bật/tắt yêu thích:", error);
        return res.status(500).json({ message: "Lỗi server khi xử lý yêu thích." });
    }
};

exports.getFavoritesByUser = async (req, res) => {
    try {
        const { userId } = req.params; // ✅ Route đã đúng: /favorite/user/:userId
        console.log("📥 [getFavoritesByUser] userId nhận vào:", userId);

        const service = new FavoriteService(MongoDB.client);
        const result = await service.getFavoritesByUser(userId);

        console.log("✅ [getFavoritesByUser] Trả về", result.length, "sản phẩm yêu thích");
        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách yêu thích:", error);
        return res.status(500).json({ message: "Lỗi server khi lấy danh sách yêu thích." });
    }
};



// ❓ Kiểm tra có yêu thích hay không
exports.isFavorite = async (req, res) => {
    try {
        const { manguoidung, masanpham } = req.body;
        console.log("🔎 [isFavorite] Kiểm tra với:", { manguoidung, masanpham });

        if (!manguoidung || !masanpham) {
            console.warn("⚠️ [isFavorite] Thiếu thông tin!");
            return res.status(400).json({ message: "Thiếu thông tin manguoidung hoặc masanpham." });
        }

        const service = new FavoriteService(MongoDB.client);
        const exists = await service.isFavorite({ manguoidung, masanpham });

        console.log("✅ [isFavorite] Tồn tại:", exists);
        return res.status(200).json({ isFavorite: exists });
    } catch (error) {
        console.error("❌ Lỗi khi kiểm tra yêu thích:", error);
        return res.status(500).json({ message: "Lỗi server khi kiểm tra yêu thích." });
    }
};

// 🗑️ Xóa yêu thích theo ID
exports.deleteFavoriteById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🗑️ [deleteFavoriteById] Xóa ID:", id);

        const favoriteService = new FavoriteService(MongoDB.client);
        const result = await favoriteService.deleteFavoriteById(id);

        console.log("✅ [deleteFavoriteById] Kết quả:", result);
        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("❌ Lỗi server khi xóa yêu thích:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa yêu thích." });
    }
};
