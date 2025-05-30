const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const categoryController = require("../controllers/categories.controller");
const productController = require("../controllers/product.controller");
const sizeController = require("../controllers/sizes.controller");
const promotionsController = require("../controllers/promotions.controller");
const message = require("../utils/messages");

// Trang chính ví dụ trang đăng nhập
router.get("/", (req, res) => {
   res.json({ message: message.info.SIGNIN_PAGE });
});

// Dashboard admin
router.get("/dashboard", adminController.adminDashboard);

// Quản lý user
router.get("/user_list", adminController.getListUsers);
router.patch("/user/status/:id", adminController.toggleUserStatus);

// Quản lý khuyến mãi
router.post("/promotions", promotionsController.createPromotions);
router.get("/promotions", promotionsController.getAllPromotions);
router.patch("/promotions/status/:id", promotionsController.deactivatePromotionById);

// Quản lý danh mục
router.get("/categories", categoryController.getAllCategories);
router.post("/categories", categoryController.createCategory);

// Quản lý sản phẩm
router.post("/products", productController.createProduct);
router.get("/products", productController.getAllProducts);

// Các route tĩnh liên quan đến sản phẩm đặt trước route có param :id
router.get("/products/search", productController.searchProducts);
router.get("/products/sizes", sizeController.getAllSizes);

// Route lấy sản phẩm theo ID, đặt cuối cùng để tránh nhầm lẫn với các route trên
router.get("/products/:id", productController.getProductById);

router.put("/products/:id", productController.updateProduct);
router.delete("/products/:id", productController.deleteProduct);

module.exports = router;
