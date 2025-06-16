const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const orderController = require("../controllers/order.controller");
const message = require("../utils/messages");
{/*Lấy thông tin người dùng*/}
router.get("/:id",userController.findOne);
router.get("/location/list", userController.getUserLocations);
router.post("/location", userController.addUserLocation);
router.delete("/location/:id",userController.deleteUserLocation);

// ----- ORDER ROUTES -----

// Lấy danh sách đơn hàng theo userId
router.get("/orders/:userId", orderController.getOrdersByUserId);

// Lấy chi tiết đơn hàng theo orderId
router.get("/orders/detail/:orderId", orderController.getOrderDetailById);

module.exports = router;