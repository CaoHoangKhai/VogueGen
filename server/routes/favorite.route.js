const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');

// Toggle (thêm nếu chưa có, xóa nếu đã có)
router.post('/toggle', favoriteController.toggleFavorite);
// Kiểm tra sản phẩm đã được yêu thích chưa (POST)
router.post('/is-favorite', favoriteController.isFavorite);
// Lấy danh sách sản phẩm yêu thích theo người dùng
router.get('/user/:manguoidung', favoriteController.getFavoritesByUser);

// Xóa bản ghi yêu thích theo _id
router.delete('/:id', favoriteController.deleteFavoriteById);

module.exports = router;