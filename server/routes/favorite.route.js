const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");

// ================== ROUTES YÊU THÍCH ==================

/**
 * Toggle yêu thích sản phẩm (thêm nếu chưa có, xoá nếu đã có)
 * POST /favorite/toggle
 */
router.post("/toggle", favoriteController.toggleFavorite);

/**
 * Kiểm tra sản phẩm đã được người dùng yêu thích chưa
 * POST /favorite/is-favorite
 */
router.post("/is-favorite", favoriteController.isFavorite);

/**
 * Lấy danh sách sản phẩm yêu thích của người dùng
 * GET /favorite/user/:manguoidung
 * @param {String} manguoidung - ID của người dùng
 */
router.get("/user/:userId", favoriteController.getFavoritesByUser);



/**
 * Xoá bản ghi yêu thích theo ID
 * DELETE /favorite/:id
 * @param {String} id - ID của bản ghi yêu thích
 */
router.delete("/:id", favoriteController.deleteFavoriteById);

module.exports = router;
