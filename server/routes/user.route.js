const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

// ================== ROUTES NGƯỜI DÙNG ==================

/**
 * Lấy thông tin chi tiết người dùng theo ID
 * GET /user/:userId
 */
router.get("/:userId", userController.findOne);

/**
 * Lấy danh sách địa chỉ giao hàng của người dùng
 * GET /user/location/list/:userId
 */
router.get("/location/list/:userId", userController.getUserLocations);


/**
 * Thêm địa chỉ giao hàng mới cho người dùng
 * POST /user/location
 */
router.post("/location", userController.addUserLocation);

/**
 * Xoá địa chỉ giao hàng theo ID
 * DELETE /user/location/:id
 */
router.delete("/location/:id", userController.deleteUserLocation);

module.exports = router;
