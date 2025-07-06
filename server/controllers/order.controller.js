const MongoDB = require("../utils/mongodb.util");
const OrderService = require("../services/order.service");

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

        const service = new OrderService(MongoDB.client);
        const result = await service.getOrderByIdWithDetails(orderId);

        if (result.success) {
            console.log("✅ [getOrderDetailById] Chi tiết đơn hàng:", JSON.stringify(result.data, null, 2));
        } else {
            console.warn("❌ [getOrderDetailById] Không tìm thấy đơn hàng.");
        }

        res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
        console.error("🔥 [getOrderDetailById] Lỗi:", error.message);
        res.status(500).json({
            success: false,
            message: "Lỗi server khi lấy chi tiết đơn hàng.",
            error: error.message
        });
    }
};

exports.getLatestConfirmedOrders = async (req, res) => {
  try {
    const orderService = new OrderService(MongoDB.client);
    const result = await orderService.getLatestConfirmedOrders(5);

    if (!result.success) {
      return res.status(500).json({ message: result.message });
    }

    return res.json(result.data);
  } catch (error) {
    console.error("❌ [getLatestConfirmedOrders] Lỗi:", error.message);
    return res.status(500).json({ message: "Lỗi khi lấy đơn hàng mới nhất" });
  }
};