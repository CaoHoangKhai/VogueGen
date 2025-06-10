const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

router.get("/user/:userId", cartController.getCartByUserId);
router.post("/add", cartController.addToCart);

// Tăng số lượng sản phẩm trong giỏ hàng theo _id
router.put("/increase/:id", cartController.increaseQuantity);

// Giảm số lượng sản phẩm trong giỏ hàng theo _id (nếu = 0 thì xóa)
router.put("/decrease/:id", cartController.decreaseQuantity);


router.put("/update/:id", cartController.updateQuantity);

module.exports = router;