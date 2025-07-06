const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");


const adminController = require("../controllers/admin.controller");
const productController = require("../controllers/product.controller");


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
// ================== ROUTES ADMIN ==================

/**
 * Trang đăng nhập admin (trả lời mặc định)
 * GET /admin/
 */
router.get("/", (req, res) => {
  res.json({ message: "Trang đăng nhập admin" });
});

/**
 * Trang dashboard admin
 * GET /admin/dashboard
 */
router.get("/dashboard", adminController.adminDashboard);

/**
 * Lấy danh sách người dùng
 * GET /admin/user_list
 */
router.get("/user_list", adminController.getListUsers);

/**
 * Bật/tắt trạng thái hoạt động của người dùng
 * PATCH /admin/user/status/:id
 * @param {String} id - ID của người dùng
 */
router.patch("/user/status/:userId", adminController.toggleUserStatus);



router.get("/products",productController.getAllProducts)

router.post('/products', upload.any(), productController.createProduct);
module.exports = router;
