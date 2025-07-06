const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categories.controller");
const productController = require("../controllers/product.controller");
// ================== ROUTES DANH MỤC ==================

/**
 * Lấy danh sách tất cả danh mục
 * GET /categories/
 */
router.get("/", categoryController.getAllCategories);

/**
 * Tạo danh mục mới
 * POST /categories/
 */
router.post("/", categoryController.createCategory);

/**
 * Lấy danh sách sản phẩm theo slug của danh mục
 * GET /products/category/:slug
 */
router.get("/:slug", productController.getFullProductsByCategorySlug);
module.exports = router;
