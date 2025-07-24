const MongoDB = require("../utils/mongodb.util");
const OrderService = require("../services/order.service");
const DesignService = require("../services/design.service");

exports.createOrder = async (req, res) => {
    try {
        console.log("📦 [createOrder] BẮT ĐẦU XỬ LÝ");

        if (!req.body || Object.keys(req.body).length === 0) {
            console.warn("⚠️ [createOrder] Thiếu dữ liệu đơn hàng trong request body.");
            return res.status(400).json({
                success: false,
                message: "Thiếu dữ liệu đơn hàng trong yêu cầu."
            });
        }

        console.log("📥 [createOrder] DỮ LIỆU CLIENT GỬI LÊN:", JSON.stringify(req.body, null, 2));

        const service = new OrderService(MongoDB.client);
        const result = await service.createOrder(req.body);

        console.log("✅ [createOrder] KẾT QUẢ TRẢ VỀ:", JSON.stringify(result, null, 2));

        return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
        console.error("🔥 [createOrder] Lỗi:", error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi tạo đơn hàng.",
            error: error.message
        });
    }
};

exports.getAllOrdersSorted = async (req, res) => {
    try {
        console.log("📥 [getAllOrdersSorted] YÊU CẦU LẤY TOÀN BỘ ĐƠN HÀNG (admin)");

        const service = new OrderService(MongoDB.client);
        const orders = await service.getAllOrdersSorted();

        console.log(`✅ [getAllOrdersSorted] Tìm thấy ${orders.length} đơn hàng`);

        res.status(200).json(orders);
    } catch (error) {
        console.error("🔥 [getAllOrdersSorted] Lỗi:", error.message);
        res.status(500).json({
            success: false,
            message: "Không thể lấy danh sách đơn hàng.",
            error: error.message
        });
    }
};

exports.getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log("📥 [getOrdersByUserId] Yêu cầu lấy đơn hàng theo userId:", userId);

        const service = new OrderService(MongoDB.client);
        const result = await service.getOrdersByUserId(userId);

        console.log("✅ [getOrdersByUserId] Kết quả trả về:", JSON.stringify(result, null, 2));

        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("🔥 [getOrdersByUserId] Lỗi:", error.message);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy đơn hàng.",
            error: error.message
        });
    }
};


exports.getOrderDetailById = async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log("📥 [getOrderDetailById] Yêu cầu lấy chi tiết đơn hàng:", orderId);

        const orderService = new OrderService(MongoDB.client);
        const designService = new DesignService(MongoDB.client);

        const result = await orderService.getOrderByIdWithDetails(orderId);

        if (!result.success) {
            console.warn("❌ [getOrderDetailById] Không tìm thấy đơn hàng.");
            return res.status(404).json(result);
        }

        // ✅ Xử lý phần thêm designLink nếu có madesign
        const updatedDetails = await Promise.all(
            result.data.chitiet.map(async (item) => {
                if (item.madesign) {
                    const link = await designService.getDesignLink(item.madesign);
                    return { ...item, designLink: link || null };
                }
                return item;
            })
        );

        // Gán lại vào đơn hàng
        result.data.chitiet = updatedDetails;

        console.log("✅ [getOrderDetailById] Chi tiết đơn hàng:", JSON.stringify(result.data, null, 2));
        res.status(200).json(result);

    } catch (error) {
        console.error("🔥 [getOrderDetailById] Lỗi:", error.message);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết đơn hàng.",
            error: error.message
        });
    }
};


exports.getLatestPendingOrders = async (req, res) => {
    try {
        const orderService = new OrderService(MongoDB.client);
        const result = await orderService.getLatestPendingOrders(5);

        if (!result.success) {
            return res.status(500).json({ message: result.message });
        }

        return res.json(result.data);
    } catch (error) {
        console.error("❌ [getLatestPendingOrders] Lỗi:", error.message);
        return res.status(500).json({ message: "Lỗi khi lấy đơn hàng mới nhất" });
    }
};

exports.countOrdersByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orderService = new OrderService(MongoDB.client);
        console.log("📥 [countOrdersByUser] Yêu cầu đếm đơn hàng của người dùng:", userId);
        const result = await orderService.getTotalOrdersByUserId(userId);
        res.send(result);
    } catch (error) {
        console.error("❌ [countOrdersByUser] Lỗi:", error.message);
        res.status(500).send({
            success: false,
            message: "Lỗi server khi tính tổng đơn hàng.",
            error: error.message
        });
    }
};

exports.getTotalSpentByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const orderService = new OrderService(MongoDB.client);
        const result = await orderService.getTotalSpentByUserId(userId);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message || "Không thể tính tổng tiền đã tiêu."
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ [getTotalSpentByUser] Controller Lỗi:", error.message);
        return res.status(500).json({
            success: false,
            message: "Đã xảy ra lỗi khi lấy tổng tiền đã tiêu.",
            error: error.message
        });
    }
};
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Thiếu mã đơn hàng.",
            });
        }
        const orderService = new OrderService(MongoDB.client);
        const result = await orderService.cancelOrder(orderId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ [cancelOrder] Lỗi controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi huỷ đơn hàng.",
            error: error.message,
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { trangthai } = req.body;

        console.log("➡️ [updateOrderStatus] orderId:", orderId);
        console.log("➡️ [updateOrderStatus] trangthai (body):", trangthai);

        const orderService = new OrderService(MongoDB.client);
        const result = await orderService.updateTrangThaiDonHang(orderId, trangthai);

        console.log("✅ [updateOrderStatus] Kết quả update:", result);

        if (!result.success) {
            console.warn("⚠️ [updateOrderStatus] Không thành công:", result.message);
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("❌ [updateOrderStatus] Lỗi controller:", error.message);
        return res.status(500).json({
            success: false,
            message: "Lỗi server khi cập nhật trạng thái đơn hàng.",
            error: error.message
        });
    }
};

