const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// ================== ROUTES ĐƠN HÀNG ==================

// Tạo đơn hàng
router.post("/", orderController.createOrder);

// Lấy tất cả đơn hàng (Admin)
router.get("/", orderController.getAllOrdersSorted);

// Lấy đơn hàng theo userId
router.get("/user/:userId", orderController.getOrdersByUserId);
router.get("/latest", orderController.getLatestConfirmedOrders);
// Lấy chi tiết đơn hàng theo orderId
router.get("/:orderId", orderController.getOrderDetailById);



module.exports = router;
