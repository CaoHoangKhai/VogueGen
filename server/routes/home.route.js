const exxpress = require('express');
const router = exxpress.Router();
const productController = require('../controllers/product.controller'); 

// Route lấy tất cả sản phẩm
router.get('/products', productController.getAllProducts);


module.exports = router;