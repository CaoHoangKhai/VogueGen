const OrderService = require("../services/order.service");
const UserService = require("../services/user.service");
const ProductService = require("../services/product.service");
const MongoDB = require("../utils/mongodb.util");
exports.getListUsers = async (req, res, next) => {
    try {
        console.log("📥 [GET USERS] Yêu cầu lấy danh sách người dùng.");

        const userService = new UserService(MongoDB.client);
        const users = await userService.getListUser();

        if (!users.length) {
            console.warn("⚠️ [GET USERS] Không tìm thấy người dùng nào.");
            return res.status(404).json({ message: "Không tìm thấy người dùng nào." });
        }

        console.log(`✅ [GET USERS] Đã lấy ${users.length} người dùng.`);
        return res.json(users);
    } catch (error) {
        console.error("❌ [GET USERS] Lỗi:", error.message);
        return res.status(500).json({ message: `Lỗi khi lấy danh sách độc giả: ${error.message}` });
    }
};


exports.adminDashboard = async (req, res, next) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const userService = new UserService(MongoDB.client);
        const productService = new ProductService(MongoDB.client);

        console.log("📊 [ADMIN DASHBOARD] Đang tổng hợp dữ liệu...");

        const [
            customerCount,
            productCount,
            ordersIn28DaysResult,
            revenue28DaysResult
        ] = await Promise.all([
            userService.adminDashboard(), // Hàm trả về số lượng khách hàng
            productService.totalProducts(), // Hàm trả về số lượng sản phẩm
            orderService.getOrdersInLast28Days(), // Trả về danh sách đơn
            orderService.getRevenueInLast28Days() // Trả về tổng doanh thu
        ]);

        const totalOrders28days = ordersIn28DaysResult?.data?.length || 0;
        const totalRevenue28days = revenue28DaysResult?.totalRevenue || 0;

        return res.json({
            totalCustomers: customerCount,
            totalProducts: productCount,
            totalOrders28days,
            totalRevenue28days
        });
    } catch (error) {
        console.error("❌ [ADMIN DASHBOARD] Lỗi:", error.message);
        return res.status(500).json({
            message: `Lỗi khi lấy dữ liệu dashboard: ${error.message}`
        });
    }
};
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const userId = req.params.userId; // ✅ Đúng tên

        console.log(`🔄 [TOGGLE USER STATUS] Đang cập nhật trạng thái cho userId: ${userId}`);

        const userService = new UserService(MongoDB.client);
        const success = await userService.toggleUserStatus(userId);

        if (success) {
            console.log(`✅ [TOGGLE USER STATUS] Cập nhật thành công cho userId: ${userId}`);
            return res.status(200).json({ message: "Cập nhật trạng thái thành công." });
        } else {
            console.warn(`⚠️ [TOGGLE USER STATUS] Không tìm thấy hoặc cập nhật thất bại cho userId: ${userId}`);
            return res.status(404).json({ message: "Không tìm thấy người dùng hoặc cập nhật thất bại." });
        }
    } catch (error) {
        console.error("❌ [TOGGLE USER STATUS] Lỗi:", error.message);
        return res.status(500).json({ message: "Lỗi server." });
    }
};
