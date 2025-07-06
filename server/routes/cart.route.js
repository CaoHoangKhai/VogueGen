const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// ================== ROUTES GIỎ HÀNG ==================

/**
 * Lấy giỏ hàng của người dùng
 * GET /cart/user/:userId
 * @param {String} userId - ID của người dùng
 */
router.get("/user/:userId", cartController.getCartByUserId);

/**
 * Thêm sản phẩm vào giỏ hàng
 * POST /cart/add
 */
router.post("/add", cartController.addToCart);

/**
 * Tăng số lượng sản phẩm trong giỏ hàng
 * PUT /cart/increase/:id
 * @param {String} id - ID của mục trong giỏ hàng (document _id)
 */
router.put("/increase/:cartId", cartController.increaseQuantity);

/**
 * Giảm số lượng sản phẩm trong giỏ hàng
 * PUT /cart/decrease/:id
 * @param {String} id - ID của mục trong giỏ hàng (document _id)
 */
router.put("/decrease/:cartId", cartController.decreaseQuantity);

/**
 * Cập nhật số lượng sản phẩm cụ thể trong giỏ
 * PUT /cart/update/:id
 * @param {String} id - ID của mục trong giỏ hàng (document _id)
 */
router.put("/update/:cartId", cartController.updateQuantity);

module.exports = router;
