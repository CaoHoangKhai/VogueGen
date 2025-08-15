const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const productController = require("../controllers/product.controller");
const adminController = require("../controllers/admin.controller"); // nếu dùng ở chỗ khác

// ========== Multer config ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "images"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "");
    const filename = `${Date.now()}-${baseName}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Nếu bạn muốn chấp nhận nhiều field tên khác nhau, có thể dùng upload.fields([...])
// Hiện tại client append các file với field name "images", nên dùng upload.array("images").

// ========== Routes ==========
// NOTE: Đặt các route tĩnh / cụ thể trước route động "/:productId"
router.get("/", productController.getAllProducts);

// Theo danh mục (slug) - đặt trước để không bị bắt bởi "/:productId"
router.get("/category/:slug", productController.getFullProductsByCategorySlug);

// Lấy màu / ảnh theo productId
router.get("/:productId/colors", productController.getColorsByProductId);
router.get("/:productId/images/:color", productController.getImagesByColor);

// Lấy chi tiết product theo ID
router.get("/:productId", productController.getProductById);

// Update product - chấp nhận multipart/form-data với field "images" (nhiều file)
router.put("/:productId", upload.array("images"), productController.updateProduct);

// Nếu còn route admin khác, register ở đây (ví dụ)
// router.post("/admin/...", adminController.someHandler);
router.delete("/:productId", productController.deleteProduct);
module.exports = router;
