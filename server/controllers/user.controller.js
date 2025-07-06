const UserService = require("../services/user.service");
const LocationService = require("../services/location.service");
const OrderService = require("../services/order.service");
const MongoDB = require("../utils/mongodb.util");

exports.findOne = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log("📥 [findOne] Nhận ID:", userId);

        if (!userId) {
            console.warn("⚠️ [findOne] Thiếu mã người dùng");
            return res.status(400).json({ message: "Thiếu mã người dùng" });
        }

        const userService = new UserService(MongoDB.client);
        const user = await userService.findUserById(userId);
        console.log("🔍 [findOne] Người dùng:", user);

        if (!user) {
            console.warn("❌ [findOne] Không tìm thấy người dùng:", userId);
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const locationService = new LocationService(MongoDB.client);
        const addressCount = await locationService.countUserLocations(userId);
        console.log("📦 [findOne] Số địa chỉ:", addressCount);

        return res.json({ ...user, sodiachi: addressCount });
    } catch (error) {
        console.error("🔥 [findOne] Lỗi:", error);
        return res.status(500).json({ message: `Lỗi: ${error.message}` });
    }
};

exports.addUserLocation = async (req, res, next) => {
    try {
        const locationService = new LocationService(MongoDB.client);
        const payload = req.body;
        console.log("📥 [addUserLocation] Payload:", payload);

        if (!payload.manguoidung || !payload.thanhpho || !payload.quan_huyen || !payload.diachi) {
            console.warn("⚠️ [addUserLocation] Thiếu dữ liệu bắt buộc");
            return res.status(400).json({ message: "Thiếu thông tin địa chỉ bắt buộc." });
        }

        const currentCount = await locationService.countUserLocations(payload.manguoidung);
        console.log("🔢 [addUserLocation] Số địa chỉ hiện tại:", currentCount);

        if (currentCount >= 5) {
            console.warn("⚠️ [addUserLocation] Vượt quá số lượng địa chỉ cho phép");
            return res.status(400).json({ message: "Người dùng đã có tối đa 5 địa chỉ." });
        }

        const insertedId = await locationService.addUserLocation(payload);
        console.log("✅ [addUserLocation] Đã thêm địa chỉ với ID:", insertedId);

        return res.status(201).json({ message: "Thêm địa chỉ thành công", id: insertedId });
    } catch (error) {
        console.error("🔥 [addUserLocation] Lỗi server:", error);
        return res.status(500).json({ message: `Lỗi server: ${error.message}` });
    }
};

exports.deleteUserLocation = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("📥 [deleteUserLocation] ID cần xóa:", id);

        if (!id) {
            console.warn("⚠️ [deleteUserLocation] Thiếu mã địa chỉ cần xóa");
            return res.status(400).json({ message: "Thiếu mã địa chỉ cần xóa." });
        }

        const locationService = new LocationService(MongoDB.client);
        const deleted = await locationService.deleteUserLocation(id);
        console.log("🗑️ [deleteUserLocation] Kết quả:", deleted);

        if (!deleted) {
            console.warn("❌ [deleteUserLocation] Không tìm thấy địa chỉ để xóa");
            return res.status(404).json({ message: "Không tìm thấy địa chỉ để xóa hoặc đã bị xóa trước đó." });
        }

        return res.json({ message: "Đã xóa địa chỉ khỏi danh sách thành công." });
    } catch (error) {
        console.error("🔥 [deleteUserLocation] Lỗi server:", error);
        return res.status(500).json({ message: `Lỗi server: ${error.message}` });
    }
};

exports.getUserLocations = async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log("📥 [getUserLocations] userId:", userId);

        if (!userId) {
            console.warn("⚠️ [getUserLocations] Thiếu userId trong params");
            return res.status(400).json({ message: "Thiếu userId" });
        }

        const locationService = new LocationService(MongoDB.client);
        const locations = await locationService.getUserLocations(userId);
        console.log("📦 [getUserLocations] Danh sách địa chỉ:", locations);

        return res.json(locations);
    } catch (error) {
        console.error("🔥 [getUserLocations] Lỗi:", error);
        return res.status(500).json({ message: error.message });
    }
};;

exports.getListUsers = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const users = await userService.findAll();
        console.log("📦 [getListUsers] Danh sách người dùng:", users);

        if (!users.length) {
            console.warn("⚠️ [getListUsers] Không tìm thấy người dùng nào");
            return res.status(404).json({ message: "Không tìm thấy người dùng nào." });
        }

        return res.json(users);
    } catch (error) {
        console.error("🔥 [getListUsers] Lỗi khi lấy danh sách người dùng:", error);
        return res.status(500).json({ message: `Lỗi khi lấy danh sách độc giả: ${error.message}` });
    }
};
