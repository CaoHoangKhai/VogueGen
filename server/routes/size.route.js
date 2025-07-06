const express = require("express");
const router = express.Router();
const sizeController = require("../controllers/sizes.controller");

// ================== ROUTES KÍCH THƯỚC ==================

/**
 * Lấy danh sách tất cả kích thước sản phẩm (size)
 * GET /sizes/
 */
router.get("/", sizeController.getAllSizes);

module.exports = router;
