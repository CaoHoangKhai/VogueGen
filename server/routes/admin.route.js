const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const adminController = require("../controllers/admin.controller");
const categoryController = require("../controllers/categories.controller");
const productController = require("../controllers/product.controller");
const sizeController = require("../controllers/sizes.controller");
const promotionsController = require("../controllers/promotions.controller");

const orderController = require("../controllers/order.controller");
const message = require("../utils/messages");

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public/images"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '');
    const filename = Date.now() + '-' + baseName + ext;
    cb(null, filename);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

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
router.post('/products', upload.any(), productController.createProduct);
router.get("/products", productController.getAllProducts);

// Các route tĩnh liên quan đến sản phẩm đặt trước route có param :id
router.get("/products/search", productController.searchProducts);
router.get("/products/sizes", sizeController.getAllSizes);

// Quản lý đơn hàng
router.get("/orders", orderController.getAllOrdersSorted);

// Route lấy sản phẩm theo ID, đặt cuối cùng để tránh nhầm lẫn với các route trên
router.get("/products/:id", productController.getProductById);

// ⚠️ Cần upload.any() để nhận ảnh

router.delete("/products/:id", productController.deleteProduct);

// Cần đặt các route khác trước route /:id để tránh nhầm
router.put('/products/:id', upload.any(), productController.updateProduct);

module.exports = router;
