const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const message = require("../utils/messages");
router.get("/",productController.getAllProducts);
router.get('/category/:slug', productController.getFullProductsByCategorySlug);
router.get("/:id/colors", productController.getColorsByProductId);
router.get("/:productId/images/:color", productController.getImagesByColor);
router.get("/:productId",productController.getProductById)

module.exports = router;