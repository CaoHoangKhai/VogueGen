const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const message = require("../utils/messages");

// ====== Route chung ======
router.get("/", productController.getAllProducts);
router.get("/best-selling", productController.getTopSellingProducts);

// ====== Theo danh mục ======
router.get("/category/:slug", productController.getFullProductsByCategorySlug);

// ====== Theo productId ======
router.get("/:productId", productController.getProductById);
router.get("/:productId/colors", productController.getColorsByProductId);
router.get("/:productId/images/:color", productController.getImagesByColor);

module.exports = router;
