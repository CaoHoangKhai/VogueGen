const UserService = require("../services/user.service");
const LocationService = require("../services/location.service");

const MongoDB = require("../utils/mongodb.util");

exports.findOne = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Thiếu mã người dùng" });
        }

        const userService = new UserService(MongoDB.client);
        const user = await userService.findUserById(id);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const locationService = new LocationService(MongoDB.client);
        const addressCount = await locationService.countUserLocations(id);


        return res.json({
            ...user,
            sodiachi: addressCount
        });
    } catch (error) {
        return res.status(500).json({ message: `Lỗi: ${error.message}` });
    }
};


exports.addUserLocation = async (req, res, next) => {
    try {
        const locationService = new LocationService(MongoDB.client);
        const payload = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!payload.manguoidung || !payload.thanhpho || !payload.quan_huyen || !payload.diachi) {
            return res.status(400).json({ message: "Thiếu thông tin địa chỉ bắt buộc." });
        }

        // Đếm số địa chỉ hiện tại của người dùng
        const currentCount = await locationService.countUserLocations(payload.manguoidung);

        if (currentCount >= 5) {
            return res.status(400).json({ message: "Người dùng đã có tối đa 5 địa chỉ." });
        }

        // Thêm địa chỉ mới
        const insertedId = await locationService.addUserLocation(payload);

        return res.status(201).json({ message: "Thêm địa chỉ thành công", id: insertedId });
    } catch (error) {
        return res.status(500).json({ message: `Lỗi server: ${error.message}` });
    }
};

exports.deleteUserLocation = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Thiếu mã địa chỉ cần xóa." });
        }

        const locationService = new LocationService(MongoDB.client);

        const deleted = await locationService.softDeleteUserLocation(id);

        if (!deleted) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ để xóa hoặc đã bị xóa trước đó." });
        }

        return res.json({ message: "Đã ẩn địa chỉ khỏi danh sách thành công." });
    } catch (error) {
        return res.status(500).json({ message: `Lỗi server: ${error.message}` });
    }
};


exports.getUserLocations = async (req, res, next) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "Thiếu userId" });
        }

        const locationService = new LocationService(MongoDB.client);
        const locations = await locationService.getUserLocations(userId);

        return res.json(locations);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
