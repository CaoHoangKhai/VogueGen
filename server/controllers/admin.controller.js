const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");

exports.getListUsers = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const users = await userService.getListUser();
        if (!users.length) {
            return res.status(404).json({ message: "Không tìm thấy người dùng nào." });
        }
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ message: `Lỗi khi lấy danh sách độc giả: ${error.message}` });
    }
}

exports.adminDashboard = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const customerCount = await userService.adminDashboard();

        return res.json({ totalCustomers: customerCount });
    } catch (error) {
        return res.status(500).json({ message: `Lỗi khi lấy số lượng khách hàng: ${error.message}` });
    }
}

exports.toggleUserStatus = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const userService = new UserService(MongoDB.client);
        const success = await userService.toggleUserStatus(userId);

        if (success) {
            return res.status(200).json({ message: "Cập nhật trạng thái thành công." });
        } else {
            return res.status(404).json({ message: "Không tìm thấy người dùng hoặc cập nhật thất bại." });
        }
    } catch (error) {
        console.error("Lỗi trong toggleUserStatus:", error.message);
        return res.status(500).json({ message: "Lỗi server." });
    }
}