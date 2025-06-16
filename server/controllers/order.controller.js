const MongoDB = require("../utils/mongodb.util");
const OrderService = require("../services/order.service");

exports.createOrder = async (req, res) => {
    try {
        console.log("📦 DỮ LIỆU CLIENT GỬI LÊN:");
        console.log(req.body);
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu đơn hàng trong yêu cầu."
            });
        }

        const orderService = new OrderService(MongoDB.client);
        const result = await orderService.createOrder(req.body);

        if (result.success) {
            return res.status(201).json(result);
        } else {
            return res.status(400).json({
                success: false,
                message: result.message || "Tạo đơn hàng thất bại.",
                error: result.error || null
            });
        }
    } catch (error) {
        console.error("Lỗi server khi tạo đơn hàng:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo đơn hàng.",
            error: error.message
        });
    }
};


exports.getAllOrdersSorted = async (req, res) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const orders = await orderService.getAllOrdersSorted();
        res.status(200).json(orders);
    } catch (error) {
        console.error("Lỗi server khi lấy danh sách đơn hàng:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy danh sách đơn hàng.",
            error: error.message
        });
    }
};

exports.getOrdersByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu mã người dùng."
            });
        }

        const orderService = new OrderService(MongoDB.client);
        const result = await orderService.getOrdersByUserId(userId);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi lấy đơn hàng theo userId:", error.message);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi lấy đơn hàng.",
            error: error.message
        });
    }
};

exports.getOrderDetailById = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu mã đơn hàng."
            });
        }

        const orderService = new OrderService(MongoDB.client);
        const result = await orderService.getOrderByIdWithDetails(orderId);

        return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error.message);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi lấy chi tiết đơn hàng.",
            error: error.message
        });
    }
};