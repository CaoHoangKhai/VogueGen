const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');

// Toggle (thêm nếu chưa có, xóa nếu đã có)
router.post('/toggle', favoriteController.toggleFavorite);

// Lấy danh sách sản phẩm yêu thích theo người dùng
router.get('/user/:manguoidung', favoriteController.getFavoritesByUser);


module.exports = router;
